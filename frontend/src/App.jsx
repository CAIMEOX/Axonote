import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import JsonEditModal from "./JsonEditModal";
import Toolbar from "./Toolbar";
import ListNode from "./Components/ListNode";
import BibliographyNode from "./Components/BibliographyNode";
import FormulaNode from "./Components/FormulaNode";
import ImageNode from "./Components/ImageNode";
import "@xyflow/react/dist/style.css";
import "./App.css";
import { getLayoutedElements } from "./layout";
import exampleData from "./assets/example.json";
import TextNode from "./Components/TextNode";

const nodeTypes = {
  text: TextNode,
  formula: FormulaNode,
  list: ListNode,
  image: ImageNode,
  bibliography: BibliographyNode,
};

let id = 1;
const getUniqueId = () => `node_${id++}`;

const getDescendants = (nodeId, allNodes, allEdges) => {
  const descendants = new Set();
  const edgesToHide = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const childEdges = allEdges.filter((edge) => edge.source === currentId);

    for (const edge of childEdges) {
      edgesToHide.add(edge.id);
      if (!descendants.has(edge.target)) {
        descendants.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  return { nodesToHide: descendants, edgesToHide };
};

function MindMap() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const { getNodes, getEdges, fitView } = useReactFlow();

  // Effect to keep track of the selected node
  useEffect(() => {
    const node = nodes.find((n) => n.selected);
    setSelectedNode(node);
  }, [nodes]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...newData };
        }
        return node;
      })
    );
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, type: "smoothstep" }, eds)),
    []
  );

  const handleLayout = async () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    if (currentNodes.length === 0) return;

    const layoutedNodes = await getLayoutedElements(currentNodes, currentEdges);

    setNodes([...layoutedNodes]);

    // Smoothly fit the view to the new layout
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 800 });
    }, 100);
  };

  const handleApplyJson = (graphData) => {
    // --- Data Transformation Logic ---
    const newNodes = graphData.nodes.map((n) => {
      let nodeType;
      let data = {};
      const baseNode = { id: n.id, position: n.position || { x: 0, y: 0 } };

      switch (n.raw.type) {
        case "Bibliography":
          nodeType = "bibliography";
          data = n.raw.data;
          break;
        case "Image":
          nodeType = "image";
          data = {
            url: n.raw.data.url,
            title: n.raw.data.title,
          };
          baseNode.style = { width: 300 };
          break;
        case "Text":
          nodeType = "text";
          console.log(n.raw)
          data = {
            title: n.title || "Untitled Text",
            text: n.raw.data.text,
            onTextChange: (id, text) => updateNodeData(id, { text }),
          };
          break;
        case "List":
          nodeType = "list";
          data = {
            title: n.title || n.id,
            listItems: n.raw.data || [],
          };
          break;
        case "Formula":
          nodeType = "formula";
          data = {
            formula: n.raw.data,
            onFormulaChange: (id, formula) => updateNodeData(id, { formula }),
          };
          break;
        default:
          nodeType = "Text";
          let noteContent = n.raw.data;
          if (typeof noteContent !== "string") {
            noteContent = `Type: ${n.raw.type}\n\n${JSON.stringify(
              noteContent,
              null,
              2
            )}`;
          }
          data = {
            title: n.title || n.id,
            text: noteContent,
          };
          break;
      }

      const finalNode = { ...baseNode, type: nodeType, data };
      return finalNode;
    });

    const newEdges = graphData.edges.map((e, index) => ({
      id: `e-${e.source_id}-${e.target_id}-${index}`,
      source: e.source_id,
      target: e.target_id,
      label: e.label,
      type: "smoothstep",
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Initialize the root node
  useState(async () => {
    const data = exampleData;
    handleApplyJson(data);
  }, []);

  const handleAddNode = (type) => {
    if (!selectedNode) return;

    const parentNode = selectedNode;
    const childNodeCount = edges.filter(
      (edge) => edge.source === parentNode.id && !edge.hidden
    ).length;

    const yOffset = childNodeCount * 150;

    const position = {
      x: parentNode.position.x + 350,
      y: parentNode.position.y + yOffset,
    };

    let newNode;
    switch (type) {
      case "image":
        const imageData = {
          url: "https://placehold.co/300x200?text=Axonote",
          title: "New Image",
        };
        newNode = {
          id: getUniqueId(),
          type: "image",
          position,
          data: imageData,
          style: { width: 300 },
        };
        break;
      case "text":
        const textData = {
          title: "New Paragraph",
          text: "<p>This is a text block. You can use <strong>HTML</strong> tags like <em>emphasis</em>.</p>",
          onTextChange: (id, text) => updateNodeData(id, { text }),
        };
        newNode = {
          id: getUniqueId(),
          type: "text",
          position,
          data: textData,
        };
        break;
      case "formula":
        const formulaData = {
          formula: "c = \\pm\\sqrt{a^2 + b^2}",
          onFormulaChange: (id, formula) => updateNodeData(id, { formula }),
        };
        newNode = {
          id: getUniqueId(),
          type: "formula",
          position,
          data: formulaData,
        };
        break;
      case "bibliography":
        const bibData = {
          key: "einstein1905",
          author: "Einstein, A.",
          title: "On the Electrodynamics of Moving Bodies",
          year: "1905",
          doi: "10.1002/andp.19053221004",
        };
        newNode = {
          id: getUniqueId(),
          type: "bibliography",
          position,
          data: bibData,
        };
        break;
      case "list":
        const listData = {
          title: "New List",
          listItems: [],
        };
        newNode = {
          id: getUniqueId(),
          type: "list",
          position,
          data: listData,
        };
        break;
      default:
        const infoData = { title: "New Idea", text: "Free style" };
        newNode = {
          id: getUniqueId(),
          type: "text",
          position,
          data: infoData,
        };
    }

    const newEdge = {
      id: `e-${parentNode.id}-${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
      type: "smoothstep",
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
  };

  const handleFold = () => {
    if (!selectedNode) return;
    const { nodesToHide, edgesToHide } = getDescendants(
      selectedNode.id,
      nodes,
      edges
    );
    setNodes((nds) =>
      nds.map((n) => (nodesToHide.has(n.id) ? { ...n, hidden: true } : n))
    );
    setEdges((eds) =>
      eds.map((e) => (edgesToHide.has(e.id) ? { ...e, hidden: true } : e))
    );
  };

  const handleExpand = () => {
    if (!selectedNode) return;
    // Find only direct children
    const childEdges = edges.filter((edge) => edge.source === selectedNode.id);
    const childNodeIds = new Set(childEdges.map((edge) => edge.target));
    const childEdgeIds = new Set(childEdges.map((edge) => edge.id));

    setNodes((nds) =>
      nds.map((n) => (childNodeIds.has(n.id) ? { ...n, hidden: false } : n))
    );
    setEdges((eds) =>
      eds.map((e) => (childEdgeIds.has(e.id) ? { ...e, hidden: false } : e))
    );
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Toolbar
        onAddFormulaNode={() => handleAddNode("formula")}
        onAddListNode={() => handleAddNode("list")}
        onAddBibliographyNode={() => handleAddNode("bibliography")}
        onAddImageNode={() => handleAddNode("image")}
        onAddTextNode={() => handleAddNode("text")}
        onFold={handleFold}
        onOpenJsonEditor={() => setIsJsonEditorOpen(true)}
        onExpand={handleExpand}
        onLayout={handleLayout}
        selectedNode={selectedNode}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      {isJsonEditorOpen && (
        <JsonEditModal
          exampleData={exampleData}
          onSave={handleApplyJson}
          onClose={() => setIsJsonEditorOpen(false)}
        />
      )}
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <MindMap />
  </ReactFlowProvider>
);
