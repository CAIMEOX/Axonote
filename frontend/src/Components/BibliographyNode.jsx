import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { FiBookOpen, FiUser, FiCalendar, FiKey, FiLink } from "react-icons/fi";

const BibEntry = ({ entry }) => {
  return (
    <article className="bib-entry">
      {entry.title && <p className="entry-title">{entry.title}</p>}
      <div className="entry-meta">
        {
          <span>
            <FiKey className="entry-icon" /> {entry.key}
          </span>
        }
        {entry.author && (
          <span>
            <FiUser className="entry-icon" /> {entry.author}
          </span>
        )}
        {entry.year && (
          <span>
            <FiCalendar className="entry-icon" /> {entry.year}
          </span>
        )}
      </div>
      {entry.doi && (
        <a
          href={`https://doi.org/${entry.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="entry-doi"
        >
          <FiLink className="entry-icon" />
          {entry.doi}
        </a>
      )}
    </article>
  );
};

export default memo(({ data, selected }) => {
  // data.entries should be an array of Entry objects

  return (
    <div className={`bibliography-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="info-node-handle"
      />

      <div className="bib-header">
        <FiBookOpen />
        <h3>Bibliography</h3>
      </div>

      <div className="entry-list">
        {<BibEntry key={data.key} entry={data} />}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="info-node-handle"
      />
    </div>
  );
});
