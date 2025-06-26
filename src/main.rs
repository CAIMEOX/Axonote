use anyhow::Result;
use crate::compile::compile;
mod compile;
mod def;

fn main() {
    let nodes = read_parse("data/solar.md");
    println!("{}", nodes.unwrap());
}

fn read_parse(file_path: &str) -> Result<String> {
    let content = std::fs::read_to_string(file_path)?;
    compile(&content)
}
