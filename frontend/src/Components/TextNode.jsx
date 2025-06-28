import { useState, useEffect, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FiType } from 'react-icons/fi';

export default memo(({ id, data, selected }) => {
  const { title = 'Untitled Text', text = '' } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    data.onTextChange(id, currentText);
    setIsEditing(false);
  };

  return (
    <div className={`text-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="info-node-handle" />

      <div className="text-header">
        <FiType />
        <h3>{title}</h3>
      </div>
      
      <div className="text-content">
        {isEditing ? (
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            onBlur={handleBlur}
            className="text-node-textarea"
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="text-content-view"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Right} className="info-node-handle" />
    </div>
  );
});