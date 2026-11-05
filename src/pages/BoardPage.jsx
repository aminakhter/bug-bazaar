import { useState } from 'react';
import BugList from '../components/BugList';
import BugForm from '../components/BugForm';

export default function BoardPage({ bugs, loading, error, onRetry, onAddBug }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredBugs = bugs.filter((bug) =>
    bug.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  
  if (loading) return <div>Loading bugs...</div>;
  
  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Bug Bounty Board</h2>

      <input
        type="text"
        placeholder="Search bugs by title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '8px', width: '100%', maxWidth: '300px', marginBottom: '16px' }}
      />

      <BugForm onAddBug={onAddBug} bugs={bugs} />

      <BugList bugs={filteredBugs} />
    </div>
  );
}