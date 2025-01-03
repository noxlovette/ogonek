use crate::auth::Token;
use crate::db::error::DbError;
use crate::db::AppState;
use axum::extract::Json;
use axum::extract::Path;
use axum::extract::State;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::RecordId;

#[derive(Serialize, Deserialize, Debug)]
pub struct LessonTime {
    pub custom_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LessonBody {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<RecordId>,
    pub title: String,
    pub markdown: String,
    pub assignee: RecordId,
    pub created_by: RecordId,
    pub time: LessonTime,
}

pub async fn fetch_lesson(
    State(state): State<AppState>,
    token: Token,
    id: Path<String>,
) -> Result<Json<Option<LessonBody>>, DbError> {
    tracing::info!("Attempting to fetch user");

    let db = &state.db;

    tracing::info!("token: {}", token.as_str());
    tracing::info!("id: {}", &*id);

    db.authenticate(token.as_str()).await?;

    let lesson = db.select(("lesson", &*id)).await?;

    dbg!(&lesson);
    tracing::info!("Fetch lesson successful");
    Ok(Json(lesson))
}

pub async fn list_lessons(
    State(state): State<AppState>,
    token: Token,
) -> Result<Json<Vec<LessonBody>>, DbError> {
    let db = &state.db;
    db.authenticate(token.as_str()).await?;

    let lessons: Vec<LessonBody> = db.select("lesson").await?;

    tracing::info!("Fetch lessons successful");

    Ok(Json(lessons))
}
