use anyhow::Result;
use crate::compile::compile;
mod compile;
mod def;
mod utils;

fn main() {
    let nodes = read_parse("data/bib.md");
    if let Ok(content) = nodes {
        std::fs::write("frontend/src/assets/example.json", content)
            .expect("Failed to write to frontend/src/assets/example.json");
    } else {
        eprintln!("Error reading or parsing file: {:?}", nodes);
    }
}

fn read_parse(file_path: &str) -> Result<String> {
    let content = std::fs::read_to_string(file_path)?;
    compile(&content)
}
