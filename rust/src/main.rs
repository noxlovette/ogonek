use surrealdb::engine::remote::ws::Client;
use surrealdb::engine::remote::ws::Wss;
use surrealdb::opt::auth::Root;
use surrealdb::Surreal;

use faker_rand::en_us::names::FirstName;
use surrealdb::opt::auth::Record;

use serde::{Deserialize, Serialize};
use surrealdb::{Error, RecordId};

#[derive(Debug, Serialize, Deserialize)]
struct Person {
    name: String,
    id: RecordId,
    created_by: Option<RecordId>,
}

#[derive(Serialize, Deserialize)]
struct Params<'a> {
    name: &'a str,
    pass: &'a str,
}

#[derive(Serialize, Deserialize)]
struct RecordUser {
    name: String,
    pass: String,
}

async fn make_new_user(db: &Surreal<Client>) -> Result<RecordUser, Error> {
    let name = rand::random::<FirstName>().to_string();
    let pass = rand::random::<FirstName>().to_string();
    println!("Signing in as user {name} and password {pass}");
    let jwt = db
        .signup(Record {
            access: "account",
            namespace: "namespace",
            database: "database",
            params: Params {
                name: &name,
                pass: &pass,
            },
        })
        .await?
        .into_insecure_token();
    println!("New user created!\n\nName: {name}\nPassword: {pass}\nToken: {jwt}\n\nTo log in, use this command:\n\nsurreal sql --namespace namespace --database database --pretty --token \"{jwt}\"\n");
    Ok(RecordUser { name, pass })
}

async fn get_new_token(db: &Surreal<Client>, user: &RecordUser) -> Result<(), Error> {
    let jwt = db
        .signin(Record {
            access: "account",
            namespace: "namespace",
            database: "database",
            params: Params {
                name: &user.name,
                pass: &user.pass,
            },
        })
        .await?
        .into_insecure_token();
    println!("New token! Sign in with surreal sql --namespace namespace --database database --pretty --token \"{jwt}\"\n");
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db = Surreal::new::<Wss>("db.noxlovette.com").await?;

    db.signin(Root {
        username: "firelight",
        password: "firelight",
    })
    .await?;

    db.use_ns("namespace").use_db("database").await?;

    db.query(
        "DEFINE TABLE person SCHEMALESS
        PERMISSIONS FOR 
            CREATE, SELECT WHERE $auth,
            FOR UPDATE, DELETE WHERE created_by = $auth;
    DEFINE FIELD name ON TABLE person TYPE string;
    DEFINE FIELD created_by ON TABLE person VALUE $auth READONLY;

    DEFINE INDEX unique_name ON TABLE user FIELDS name UNIQUE;
    DEFINE ACCESS account ON DATABASE TYPE RECORD
	SIGNUP ( CREATE user SET name = $name, pass = crypto::argon2::generate($pass) )
	SIGNIN ( SELECT * FROM user WHERE name = $name AND crypto::argon2::compare(pass, $pass) )
	DURATION FOR TOKEN 15m, FOR SESSION 12h
;",
    )
    .await?;

    db.query("CREATE person SET name = 'Created by root'")
        .await?;

    let user = make_new_user(&db).await?;

    get_new_token(&db, &user).await?;

    db.query("CREATE person SET name = 'Created by record user'")
        .await?;

    println!(
        "Two `person` records: {:?}\n",
        db.select::<Vec<Person>>("person").await?
    );

    db.query("DELETE person").await?;

    println!(
        "`person` created by root is still there: {:?}\n",
        db.select::<Vec<Person>>("person").await?
    );

    Ok(())
}
