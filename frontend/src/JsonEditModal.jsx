import { useState } from "react";
import { FiX } from "react-icons/fi";

import "./JsonEditModal.css";

export default function JsonEditModal({ exampleData, onSave, onClose }) {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(exampleData, null, 2)
  );
  const [error, setError] = useState("");

  const handleApply = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      onSave(parsedData);
      setError("");
      onClose(); 
    } catch (e) {
      setError(`Invalid JSON format: ${e.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content json-editor-modal">
        <button onClick={onClose} className="close-button">
          <FiX />
        </button>
        <h2>Load Graph from JSON</h2>
        <p>
          Paste your Axonote-formatted JSON below. Clicking 'Apply' will replace
          the current graph.
        </p>

        <textarea
          value={jsonText}
          style={{ width: "100%", height: "300px" }}
          onChange={(e) => setJsonText(e.target.value)}
          className="json-textarea"
        />

        {error && <div className="json-editor-error">{error}</div>}

        <div className="modal-actions">
          <button onClick={handleApply} className="save-button">
            Apply
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
