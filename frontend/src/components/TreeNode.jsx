import './TreeNode.css';

export default function TreeNode({ node }) {
  if (!node || Object.keys(node).length === 0) return null;

  return (
    <ul className="tree-list">
      {Object.entries(node).map(([key, children]) => (
        <li key={key} className="tree-item">
          <span className="tree-connector"></span>
          <div className="tree-node-label">{key}</div>
          <TreeNode node={children} />
        </li>
      ))}
    </ul>
  );
}