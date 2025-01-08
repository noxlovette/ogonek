use crate::auth::jwt::Claims;
use crate::db::error::DbError;
use crate::db::init::AppState;
use crate::models::lessons::LessonBody;
use crate::models::lessons::LessonCreateBody;
use crate::models::lessons::LessonUpdate;
use axum::extract::Json;
use axum::extract::Path;
use axum::extract::State;

pub async fn fetch_lesson(
    State(state): State<AppState>,
    Path(id): Path<String>,
    claims: Claims,
) -> Result<Json<Option<LessonBody>>, DbError> {
    let lesson = sqlx::query_as!(
        LessonBody,
        "SELECT * FROM lessons WHERE id = $1 AND (assignee = $2 OR created_by = $2)",
        id,
        claims.sub
    )
    .fetch_optional(&state.db)
    .await?;

    Ok(Json(lesson))
}

pub async fn list_lessons(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<Vec<LessonBody>>, DbError> {
    let lessons = sqlx::query_as!(
        LessonBody,
        "SELECT * FROM lessons WHERE (assignee = $1 OR created_by = $1)",
        claims.sub
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(lessons))
}

pub async fn create_lesson(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<LessonCreateBody>,
) -> Result<Json<LessonBody>, DbError> {
    dbg!(&claims);
    let lesson = sqlx::query_as!(
        LessonBody,
        "INSERT INTO lessons (id, title, topic, markdown, created_by, assignee) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *",
        nanoid::nanoid!(),
        payload.title,
        payload.topic,
        payload.markdown,
        claims.sub,
        payload.assignee
    )
    .fetch_one(&state.db)
    .await?;

    Ok(Json(lesson))
}

pub async fn delete_lesson(
    State(state): State<AppState>,
    Path(id): Path<String>,
    claims: Claims,
) -> Result<Json<LessonBody>, DbError> {
    let lesson = sqlx::query_as!(
        LessonBody,
        "DELETE FROM lessons WHERE id = $1 AND created_by = $2 RETURNING *",
        id,
        claims.sub
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(DbError::NotFound)?;

    Ok(Json(lesson))
}

pub async fn update_lesson(
    State(state): State<AppState>,
    Path(id): Path<String>,
    claims: Claims,
    Json(payload): Json<LessonUpdate>,
) -> Result<Json<LessonBody>, DbError> {
    let lesson = sqlx::query_as!(
        LessonBody,
        "UPDATE lessons 
         SET 
            title = COALESCE($1, title),
            topic =COALESCE($2, topic), 
            markdown = COALESCE($3, markdown),
            assignee = COALESCE($4, assignee)
         WHERE id = $5 AND created_by = $6
         RETURNING *",
        payload.title,
        payload.topic,
        payload.markdown,
        payload.assignee,
        id,
        claims.sub
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(DbError::NotFound)?;

    Ok(Json(lesson))
}
