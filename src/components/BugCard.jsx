import { Link } from 'react-router-dom';

export default function BugCard({ bug }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '12px', margin: '8px 0', borderRadius: '4px' }}>
      <h3>{bug.title}</h3>
      <p><strong>Severity:</strong> {bug.severity || 'Normal'}</p>
      <p>{bug.description}</p>
      <Link to={`/bugs/${bug.id}`}>View Details</Link>
    </div>
  );
}