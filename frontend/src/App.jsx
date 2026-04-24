import { useState } from 'react';
import InputSection from './components/InputSection';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/bfhl';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async (inputLines) => {
    setLoading(true);
    setError('');
    setData(null);

    const payload = inputLines.filter(line => line.trim() !== '');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to connect to the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          SRM <strong>BFHL</strong>
        </h1>
        <p className="app-subtitle">Hierarchical Tree Processor & Analytics Engine</p>
      </header>

      <main className="app-grid">
        <div className="left-column">
          <InputSection onSubmit={handleProcess} isLoading={loading} />
          {error && <div className="error-banner">{error}</div>}
        </div>

        <div className="right-column">
          {data ? (
            <ResultsDisplay result={data} />
          ) : (
            <div className="empty-state">Awaiting input data...</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;