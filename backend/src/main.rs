use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use dotenv;

#[derive(Deserialize, Serialize)]
struct ChatGPTRequest {
    question: String,
}

#[derive(Deserialize, Serialize)]
struct ChatGPTResponse {
    answer: String,
}

async fn fetch_chatgpt_response(question: &str, api_key: &str) -> Result<String, reqwest::Error> {
    let client = Client::new();
    let url = "https://api.openai.com/v1/engines/davinci/completions";


    let prompt = format!("Q: {}\nA:", question);

    let response = client
        .post(url)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "prompt": prompt,
            "max_tokens": 1000,
            "n": 1,
            "stop": ["\n"]
        }))
        .send()
        .await?;

    let json: serde_json::Value = response.json().await?;

    println!("API response: {}", json);

    let answer = json["choices"][0]["text"]
        .as_str()
        .unwrap_or("Unable to generate an answer")
        .trim()
        .to_string();

    Ok(answer)
}

async fn get_answer(web::Json(request): web::Json<ChatGPTRequest>) -> impl Responder {
    let api_key = env::var("CHATGPT_API_KEY").expect("CHATGPT_API_KEY must be set");
    println!("Using API key: {}", api_key);
    let answer_result = fetch_chatgpt_response(&request.question, &api_key).await;

    match answer_result {
        Ok(answer) => HttpResponse::Ok().json(ChatGPTResponse { answer }),
        Err(e) => {
            println!("Error fetching ChatGPT response: {}", e);
            HttpResponse::InternalServerError().body("Error fetching ChatGPT response")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::from_path(".env").ok();
    let bind_address = "127.0.0.1:8081";

    println!("Starting server at {}", bind_address);

    HttpServer::new(|| {
        App::new()
            .service(web::resource("/answer").route(web::post().to(get_answer)))
    })
    .bind(bind_address)?
    .run()
    .await
}
