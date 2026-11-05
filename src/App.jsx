import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { fetchBugs } from './mockApi';
import BoardPage from './pages/BoardPage';
import BugDetailsPage from './pages/BugDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBugs();
      setBugs(data);
    } catch (err) {
      setError(err?.message || 'Failed to load bugs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);
  
  const handleAddBug = (newBug) => {
    setBugs((prevBugs) => [newBug, ...prevBugs]);
  };

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <Routes>
        <Route
          path="/"
          element={
            <BoardPage
              bugs={bugs}
              loading={loading}
              error={error}
              onRetry={loadBugs}
              onAddBug={handleAddBug}
            />
          }
        />
        <Route path="/bugs/:id" element={<BugDetailsPage bugs={bugs} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
}