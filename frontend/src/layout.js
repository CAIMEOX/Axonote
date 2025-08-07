import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const defaultOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "elk.direction": "RIGHT",
};

export const getLayoutedElements = async (nodes, edges, options = {}) => {
  const layoutOptions = { ...defaultOptions, ...options };

  const graph = {
    id: "root",
    layoutOptions: layoutOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: node.measured?.width || node.style?.width || 300,
      height: node.measured?.height || node.style?.height || 150,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    layoutedGraph.children.forEach((layoutedNode) => {
      const node_1 = nodes.find((n) => n.id === layoutedNode.id);
      if (node_1) {
        node_1.position = { x: layoutedNode.x, y: layoutedNode.y };
      }
    });
    return nodes;
  } catch (message) {
    return console.error(message);
  }
};
