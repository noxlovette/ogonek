use crate::auth::error::{AuthError, PasswordHashError};
use crate::auth::jwt::Claims;
use crate::auth::jwt::KEYS;
use crate::models::users::User;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

pub fn generate_token(user: &User) -> Result<String, AuthError> {
    use jsonwebtoken::{encode, Header};
    use std::time::{SystemTime, UNIX_EPOCH};
    // In your signup function:
    let exp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize
        + (60 * 60 * 24); // 24 hours from now

    let claims = Claims {
        name: user.name.clone(),
        username: user.username.clone(),
        email: user.email.clone(),
        role: user.role.clone(),
        id: user.id.clone().to_string(),
        exp,
    };

    let token = encode(
        &Header::new(jsonwebtoken::Algorithm::RS256),
        &claims,
        &KEYS.encoding,
    )
    .map_err(|e| {
        eprintln!("Token creation error: {:?}", e);
        AuthError::TokenCreation
    })?;

    return Ok(token);
}

pub fn hash_password(pass: &str) -> Result<String, PasswordHashError> {
    let pass_bytes = pass.as_bytes();

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let hash = argon2.hash_password(&pass_bytes, &salt)?.to_string();
    let parsed_hash = PasswordHash::new(&hash)?;

    argon2
        .verify_password(pass_bytes, &parsed_hash)
        .map_err(|_| PasswordHashError::VerificationError)?;

    Ok(hash)
}

pub fn verify_password(hash: &str, password: &str) -> Result<bool, PasswordHashError> {
    let argon2 = Argon2::default();
    let parsed_hash = PasswordHash::new(hash)?;
    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}
