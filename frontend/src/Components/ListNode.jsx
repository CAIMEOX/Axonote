import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FiList } from 'react-icons/fi';

const ListItemRenderer = ({ item }) => {
  switch (item.type) {
    case 'Text':
      return <div className="list-item-text">{item.data}</div>;
    case 'Formula':
      try {
        const html = katex.renderToString(item.data);
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (e) {
        return <span className="formula-error-inline">Invalid Formula</span>;
      }
    case 'Link':
      return (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title || item.url}
        </a>
      );
    case 'Image':
      return (
        <div className="list-item-image">
          <img src={item.url} alt={item.title || 'list item'} />
        </div>
      );
    // Add placeholders for other types
    default:
      return <div className="list-item-unsupported">Unsupported Item: {item.type}</div>;
  }
};

export default memo(({ data, selected }) => {
  return (
    <div className={`list-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="info-node-handle" />
      
      <div className="list-node-header">
        <FiList />
        <h3>{data.title}</h3>
      </div>
      
      <div className="list-node-content">
        {data.listItems && data.listItems.length > 0 ? (
          data.listItems.map((item, index) => (
            <div key={index} className="list-item">
              <ListItemRenderer item={item} />
            </div>
          ))
        ) : (
          <div className="list-item-empty">This list is empty.</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="info-node-handle" />
    </div>
  );
});