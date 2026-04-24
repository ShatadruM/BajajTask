import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertCircle, GitMerge, ListTree, Code2, LayoutTemplate } from 'lucide-react';
import TreeNode from './TreeNode';
import './ResultsDisplay.css';

export default function ResultsDisplay({ result }) {
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'json'

  useEffect(() => {
    // Smooth fade-in animation for the cards
    if (viewMode === 'visual') {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.result-card',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [result, viewMode]);

  return (
    <div ref={containerRef} className="results-container">
      
      {/* Top Bar: Identity & View Toggle */}
      <div className="result-card top-bar">
        <div className="identity-info">
          <span><strong>User:</strong> {result.user_id}</span>
          <span><strong>Roll:</strong> {result.college_roll_number}</span>
          <span><strong>Email:</strong> {result.email_id}</span>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
          >
            <LayoutTemplate size={16} /> Visual
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
            onClick={() => setViewMode('json')}
          >
            <Code2 size={16} /> JSON
          </button>
        </div>
      </div>

      {viewMode === 'json' ? (
        /* Raw JSON View */
        <div className="result-card json-view-container">
          <pre className="json-code">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : (
        /* Visual Cards View */
        <>
          {/* Summary Stats */}
          <div className="summary-grid">
            <div className="result-card">
              <span className="stat-title"><ListTree size={18} /> Total Trees</span>
              <div className="stat-value">{result.summary.total_trees}</div>
            </div>
            <div className="result-card">
              <span className="stat-title"><AlertCircle size={18} /> Total Cycles</span>
              <div className="stat-value">{result.summary.total_cycles}</div>
            </div>
            <div className="result-card">
              <span className="stat-title"><GitMerge size={18} /> Largest Root</span>
              <div className="stat-value">{result.summary.largest_tree_root || 'N/A'}</div>
            </div>
          </div>

          {/* Invalid & Duplicates */}
          <div className="lists-grid">
            <div className="result-card list-card">
              <span className="list-title">Invalid Entries ({result.invalid_entries.length})</span>
              <div className="tags-container">
                {result.invalid_entries.length === 0 && <span className="empty-text">None</span>}
                {result.invalid_entries.map((item, i) => (
                  <span key={i} className="tag error">{item}</span>
                ))}
              </div>
            </div>
            <div className="result-card list-card">
              <span className="list-title">Duplicate Edges ({result.duplicate_edges.length})</span>
              <div className="tags-container">
                {result.duplicate_edges.length === 0 && <span className="empty-text">None</span>}
                {result.duplicate_edges.map((item, i) => (
                  <span key={i} className="tag warn">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Hierarchies Visualizer */}
          <div className="result-card">
            <h3 className="hierarchies-header">
              <ListTree size={20} color="#a1a1aa" /> Constructed Hierarchies
            </h3>
            
            {result.hierarchies.length === 0 ? (
              <p className="empty-text">No valid trees or cycles detected.</p>
            ) : (
              <div className="hierarchies-grid">
                {result.hierarchies.map((h, i) => (
                  <div key={i} className="tree-panel">
                    <div className="tree-header">
                      <span className="tree-root">Root: {h.root}</span>
                      {h.has_cycle ? (
                        <span className="cycle-badge">Cycle Detected</span>
                      ) : (
                        <span className="tree-meta">Depth: {h.depth}</span>
                      )}
                    </div>
                    {/* The Recursive Tree Renderer */}
                    <div className="tree-content-area">
                      <TreeNode node={h.tree} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}