import { useParams, Link } from 'react-router-dom';

export default function BugDetailsPage({ bugs }) {
  const { id } = useParams();
  const bug = bugs.find((b) => String(b.id) === String(id));

  if (!bug) {
    return (
      <div>
        <h2>Bug not found</h2>
        <Link to="/">Back to Board</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← Back to Board</Link>
      <h2>{bug.title}</h2>
      <p><strong>ID:</strong> {bug.id}</p>
      <p><strong>Severity:</strong> {bug.severity || 'Normal'}</p>
      <p><strong>Description:</strong> {bug.description || 'No description provided.'}</p>
    </div>
  );
}