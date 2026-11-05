import { useState } from 'react';

export default function BugForm({ onAddBug, bugs}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reject blank titles
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const newBug = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      severity,
    };

    onAddBug(newBug);
    setTitle('');
    setDescription('');
    setSeverity('Medium');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '16px 0', padding: '12px', background: '#f9f9f9' }}>
      <h3>Report a Bug</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <label>Title: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bug title"
        />
      </div>

      <div style={{ margin: '8px 0' }}>
        <label>Description: </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue..."
        />
      </div>

      <div style={{ margin: '8px 0' }}>
        <label>Severity: </label>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {bugs.map((bug) => (
                <option key={bug.id} value={bug.severity}>{bug.severity}</option>
            ))}
        </select>
      </div>

      <button type="submit">Submit Bug</button>
    </form>
  );
}