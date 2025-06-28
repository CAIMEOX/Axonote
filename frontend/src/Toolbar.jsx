import {
  FiEyeOff,
  FiGrid,
  FiEye,
  FiImage,
  FiBookOpen,
  FiType,
  FiList,
  FiCode,
  FiDivideSquare,
} from "react-icons/fi";

export default function Toolbar({
  onAddFormulaNode,
  onOpenJsonEditor,
  onAddBibliographyNode,
  onAddListNode,
  onAddTextNode,
  onAddImageNode,
  onFold,
  onExpand,
  onLayout,
  selectedNode,
}) {
  const isNodeSelected = !!selectedNode;

  return (
    <div className="toolbar">
      <button onClick={onOpenJsonEditor} title="Load graph from JSON">
        <FiCode />
      </button>
      <button onClick={onLayout} title="Apply Automatic Layout">
        <FiGrid />
      </button>
      <button
        onClick={onAddTextNode}
        disabled={!isNodeSelected}
        title="Add Text Block"
      >
        <FiType />
      </button>
      <button
        onClick={onAddImageNode}
        disabled={!isNodeSelected}
        title="Add Image Node"
      >
        <FiImage />
      </button>
      <button
        onClick={onAddBibliographyNode}
        disabled={!isNodeSelected}
        title="Add Bibliography"
      >
        <FiBookOpen />
      </button>
      <button
        onClick={onAddFormulaNode}
        disabled={!isNodeSelected}
        title="Add Formula"
      >
        <FiDivideSquare />
      </button>
      <button
        onClick={onAddListNode}
        disabled={!isNodeSelected}
        title="Add List Node"
      >
        <FiList />
      </button>
      <button onClick={onFold} disabled={!isNodeSelected} title="Fold Children">
        <FiEyeOff />
      </button>
      <button
        onClick={onExpand}
        disabled={!isNodeSelected}
        title="Expand Children"
      >
        <FiEye />
      </button>
    </div>
  );
}
