use markdown::mdast::{Link, Node as MNode, Paragraph};

pub fn canonicalize_id(id: &str) -> String {
    id.trim().replace([' ', '\n', '\r'], "-").to_lowercase()
}

pub fn extract_links_with_prefix<'a>(
    node: &'a Paragraph,
    prefix: &'a str,
) -> Option<Vec<&'a Link>> {
    let links: Vec<&Link> = node
        .children
        .iter()
        .filter_map(|child| match child {
            MNode::Link(link) if link.url.starts_with(prefix) => Some(link),
            _ => None,
        })
        .collect();

    if links.is_empty() { None } else { Some(links) }
}
