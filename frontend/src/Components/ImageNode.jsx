import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FiImage, FiAlertTriangle } from 'react-icons/fi';

export default memo(({ data, selected }) => {
  const { title = 'Untitled Image', url } = data;
  const [hasError, setHasError] = useState(!url);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`image-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="info-node-handle" />
      
      <div className="image-header">
        <FiImage />
        <h3>{title}</h3>
      </div>
      
      <div className="image-content">
        {hasError ? (
          <div className="image-error-placeholder">
            <FiAlertTriangle size={24} />
            <p>Image not available</p>
          </div>
        ) : (
          <img 
            src={url} 
            alt={title} 
            onError={handleError} 
          />
        )}
      </div>

      <Handle type="source" position={Position.Right} className="info-node-handle" />
    </div>
  );
});