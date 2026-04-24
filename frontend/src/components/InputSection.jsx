import { useState } from 'react';
import { Play } from 'lucide-react';
import './InputSection.css';

export default function InputSection({ onSubmit, isLoading }) {
  const [input, setInput] = useState('A->B\nA->C\nB->D\nC->E\nE->F\nX->Y\nY->Z\nZ->X\nP->Q\nQ->R\nG->H\nG->H\nG->I\nhello\n1->2\nA->');

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = input.split('\n');
    onSubmit(lines);
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <label className="input-label">Enter Node Edges (one per line)</label>
      <textarea
        className="node-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="A->B&#10;B->C"
        spellCheck="false"
      />
      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Processing...' : (
          <>
            <Play size={16} fill="currentColor" /> Process Graph
          </>
        )}
      </button>
    </form>
  );
}