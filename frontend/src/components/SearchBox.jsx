import React, { useState } from 'react';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8002';

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/v1/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          n_results: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2>Results ({results.length})</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((result) => (
              <div
                key={result.id}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h3>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Source:</strong> {result.source} | <strong>Score:</strong>{' '}
                  {(result.relevance_score * 100).toFixed(0)}%
                </p>
                {result.chunks && result.chunks[0] && (
                  <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#555' }}>
                    {result.chunks[0].text.substring(0, 200)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#999' }}>No results found</p>
      )}
    </div>
  );
}
