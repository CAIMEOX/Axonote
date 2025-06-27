use biblatex::Bibliography;
use core::str;
use markdown::mdast::{Code, Image, Link, Node as MNode};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct AxonoteGraph {
    pub meta: Option<Metadata>,
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
    #[serde(skip)]
    pub bibliography: Option<Bibliography>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Metadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub date: Option<String>,
    pub css: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Node {
    pub id: String,
    pub title: Option<String>,
    pub raw: TypedNode,
    pub style: NodeAttributes,
    pub position: Option<Coordinates>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(tag = "type", content = "data")]
pub enum TypedNode {
    Text(String),
    Formula(String),
    Image { title: Option<String>, url: String },
    Link { title: Option<String>, url: String },
    Bibliography(Entry),
    List(Vec<TypedNode>),
    CodeBlock { lang: Option<String>, code: String },
    Table(Table),
    MarkdownDocument(String),
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Entry {
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub year: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub doi: Option<String>,
}

impl Default for TypedNode {
    fn default() -> Self {
        TypedNode::Text(String::new())
    }
}

impl TypedNode {
    pub fn node_transform(node: Ext) -> Self {
        match node {
            Ext::M(MNode::Text(text)) => TypedNode::Text(text.value.clone()),
            Ext::M(MNode::Paragraph(_)) => TypedNode::Text("Paragraph content".to_string()),
            Ext::M(MNode::Math(formula)) => TypedNode::Formula(formula.value.clone()),
            Ext::M(MNode::Image(Image { title, url, .. })) => TypedNode::Image {
                title: title.clone(),
                url: url.clone(),
            },
            Ext::M(MNode::Link(Link { title, url, .. })) => TypedNode::Link {
                title: title.clone(),
                url: url.clone(),
            },
            Ext::M(MNode::Code(Code { lang, value, .. })) => TypedNode::CodeBlock {
                lang: lang.clone(),
                code: value.clone(),
            },
            Ext::M(MNode::ListItem(item)) => TypedNode::node_transform(Ext::M(&item.children[0])),
            Ext::M(MNode::List(items)) => TypedNode::List(
                items
                    .children
                    .iter()
                    .map(|node: &MNode| TypedNode::node_transform(Ext::M(node)))
                    .collect(),
            ),
            Ext::Typed(typed_node) => typed_node,
            _ => TypedNode::Text("Unsupported node type".to_string()),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Table {
    pub name: String,
    pub size: (usize, usize),      // rows, columns
    pub columns: Vec<Vec<String>>, // each column is a vector of strings
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Coordinates {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq)]
pub struct NodeAttributes {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub explicit_id: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub classes: Vec<String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub key_value_pairs: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct Edge {
    pub id: usize,
    pub source_id: String,
    pub target_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Ext<'a> {
    M(&'a MNode),
    Typed(TypedNode),
}
