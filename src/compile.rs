use crate::def::{AxonoteGraph, Edge, Entry, Ext, Metadata, Node, NodeAttributes, TypedNode};
use crate::utils::{canonicalize_id, extract_links_with_prefix};
use anyhow::Result;
use biblatex::{Bibliography, Chunk, Spanned};
use markdown::{
    ParseOptions,
    mdast::{Link, Node as MNode, Root},
    to_mdast,
};
use yaml_rust2::{Yaml, YamlLoader};

fn parse_options() -> ParseOptions {
    markdown::ParseOptions {
        constructs: markdown::Constructs {
            frontmatter: true,
            math_flow: true,
            gfm_footnote_definition: false,
            gfm_label_start_footnote: true,
            ..markdown::Constructs::mdx()
        },
        ..Default::default()
    }
}

#[derive(Debug, Clone, PartialEq)]
struct NodeMeta {
    original_text: String,
    id: String,
    attributes: NodeAttributes,
}

impl NodeMeta {
    fn new(text: String) -> Self {
        Self {
            original_text: text.clone(),
            id: canonicalize_id(&text),
            attributes: parse_attributes(&text),
        }
    }
}

impl AxonoteGraph {
    fn new() -> Self {
        Self {
            meta: None,
            nodes: Vec::new(),
            edges: Vec::new(),
            bibliography: None,
        }
    }

    fn add_node(&mut self, meta: NodeMeta, nodes: Vec<Ext>) {
        let typed_node = match nodes.as_slice() {
            [] => TypedNode::Text(meta.original_text.clone()),
            [x] => TypedNode::node_transform((*x).clone()),
            _xs => todo!(
                "add_node: more than one element in nodes is not supported yet {:?}",
                _xs
            ),
        };
        self.nodes.push(Node {
            id: meta.id,
            title: Some(meta.original_text),
            raw: typed_node,
            style: meta.attributes,
            position: None,
        });
    }

    fn add_edge(&mut self, from: String, to: String, label: Option<String>, id: usize) {
        let edge = Edge {
            source_id: from,
            target_id: to,
            id,
            label,
        };
        self.edges.push(edge);
    }

    fn to_json(self) -> Result<String> {
        let json = serde_json::to_string_pretty(&self)?;
        Ok(json)
    }

    fn load_bib(&mut self, yaml: &Yaml) -> Result<()> {
        if let Some(path) = yaml["bibliography"].as_str() {
            let file = std::fs::read_to_string(path)?;
            let bib = Bibliography::parse(&file).map_err(anyhow::Error::msg)?;
            self.bibliography = Some(bib);
        }
        Ok(())
    }

    fn load_meta(&mut self, yaml: &str) -> Result<()> {
        let doc: &Yaml = &YamlLoader::load_from_str(yaml)?[0];
        let css = if let Some(path) = doc["css"].as_str() {
            Some(std::fs::read_to_string(path)?)
        } else {
            None
        };
        self.meta = Some(Metadata {
            title: doc["title"].as_str().map(str::to_string),
            author: doc["author"].as_str().map(str::to_string),
            date: doc["date"].as_str().map(str::to_string),
            css,
        });
        self.load_bib(doc)
    }

    fn links_to_edges(&mut self, links: &[&Link], from: &str) {
        for link in links.iter() {
            let to = canonicalize_id(&link.url[1..]);
            let label = link.title.clone();
            self.add_edge(from.to_string(), to, label, self.edges.len());
        }
    }

    fn get_entry(&self, ref_: &Link) -> Result<Entry> {
        let stringify = |t: &[Spanned<Chunk>]| {
            t.iter()
                .map(|s| s.v.to_biblatex_string(false))
                .collect::<String>()
        };
        if let Some(bib) = &self.bibliography {
            if let Some(entry) = bib.get(&ref_.url[1..]) {
                let key = entry.key.to_string();
                let author = entry
                    .author()
                    .map(|a| a.iter().map(|b| b.name.to_string()).collect())
                    .ok();
                let title: Option<String> = entry.title().ok().map(stringify);
                let year: Option<String> = entry.get("year").map(stringify);
                let doi: Option<String> = entry.get("doi").map(stringify);
                Ok(Entry {
                    key,
                    author,
                    title,
                    year,
                    doi,
                })
            } else {
                Err(anyhow::anyhow!(
                    "get_entry: Entry not found for reference: {}",
                    ref_.url
                ))
            }
        } else {
            Err(anyhow::anyhow!("get_entry: No bibliography loaded"))
        }
    }

    fn collect(&mut self, root: Root) -> Result<()> {
        let mut w_name: Option<NodeMeta> = None;
        let mut w_nodes: Vec<Ext> = vec![];
        for (_i, child) in root.children.iter().enumerate() {
            dbg!(child);
            match child {
                MNode::Yaml(yaml) => self.load_meta(&yaml.value)?,
                MNode::Heading(data) if data.depth == 1 => match data.children.get(0) {
                    Some(MNode::Text(text)) => {
                        if let Some(name) = w_name.take() {
                            self.add_node(name, std::mem::take(&mut w_nodes));
                        }
                        w_name = Some(NodeMeta::new(text.value.clone()));
                    }
                    data => {
                        return Err(anyhow::anyhow!(
                            "collect: Expected a text node in heading, found: {:?}",
                            data
                        ));
                    }
                },
                MNode::Paragraph(para) => match extract_links_with_prefix(para, "#") {
                    Some(links) => {
                        if let Some(ref meta) = w_name {
                            self.links_to_edges(&links, &meta.id);
                        } else {
                            return Err(anyhow::anyhow!(
                                "collect: Found links in paragraph without a heading"
                            ));
                        }
                    }
                    None => match extract_links_with_prefix(para, "^") {
                        Some(refs) if refs.len() == 1 => {
                            let entry = self.get_entry(refs[0])?;
                            let ext_node = Ext::Typed(TypedNode::Bibliography(entry));
                            w_nodes.push(ext_node);
                        }
                        _ => w_nodes.push(Ext::M(child)),
                    },
                },

                MNode::Code(_) | MNode::Math(_) | MNode::Image(_) | MNode::List(_) => {
                    w_nodes.push(Ext::M(child))
                }

                MNode::FootnoteDefinition(_) | _ => {}
            }
        }
        self.add_node(w_name.unwrap(), std::mem::take(&mut w_nodes));
        Ok(())
    }
}

pub fn parse_attributes(_value: &str) -> NodeAttributes {
    NodeAttributes::default()
}

pub fn compile(input: &str) -> Result<String> {
    let ast = to_mdast(input, &parse_options()).map_err(|e| anyhow::anyhow!("compile: {}", e))?;
    match ast {
        MNode::Root(root) => {
            let mut state = AxonoteGraph::new();
            state.collect(root)?;
            state.to_json()
        }
        _ => Err(anyhow::anyhow!(
            "compile: Expected a root node, found: {:?}",
            ast
        )),
    }
}
