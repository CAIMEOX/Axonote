import { useState, useEffect, memo } from "react";
import { Handle, Position } from "@xyflow/react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { FiDivideSquare } from 'react-icons/fi';

export default memo(({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentFormula, setCurrentFormula] = useState(data.formula);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentFormula(data.formula);
  }, [data.formula]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    try {
      // Validate the formula before saving
      katex.renderToString(currentFormula);
      data.onFormulaChange(id, currentFormula);
      setIsEditing(false);
      setError(null);
    } catch (e) {
      setError("Invalid LaTeX syntax. Please correct it to save.");
    }
  };

  const renderFormula = () => {
    try {
      const html = katex.renderToString(data.formula, {
        displayMode: true,
        throwOnError: true,
      });
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      return <div className="formula-error">Invalid LaTeX Syntax</div>;
    }
  };

  return (
    <div className={`formula-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="info-node-handle"
      />

      {/* --- NEW: Header Section --- */}
      <div className="formula-header">
        <FiDivideSquare />
        <h3>Formula</h3>
      </div>

      {/* --- NEW: Content Wrapper --- */}
      <div className="formula-content">
        {isEditing ? (
          <div className="formula-editor-wrapper">
            <textarea
              value={currentFormula}
              onChange={(e) => setCurrentFormula(e.target.value)}
              onBlur={handleBlur}
              className="formula-node-textarea"
              autoFocus
            />
            {error && <div className="formula-editor-error">{error}</div>}
          </div>
        ) : (
          <div onDoubleClick={handleDoubleClick} className="formula-node-view">
            {renderFormula()}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="info-node-handle"
      />
    </div>
  );
});