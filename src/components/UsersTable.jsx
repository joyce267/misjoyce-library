import { useLibrary } from '../context/LibraryContext.jsx';

export default function UsersTable({ editingId, setEditingId }) {
  const { users, setUsers, user: me } = useLibrary();
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  const remove = (u) => {
    if (!window.confirm(`Remove member "${u.name}"?`)) return;
    setUsers(users.filter(x => x.id !== u.id));
    if (editingId === u.id) setEditingId(null);
  };

  return (
    <div>
      <table className="ledger">
        <thead>
          <tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {sorted.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td className="mono">{u.membershipId}</td>
              <td>{u.role}</td>
              <td>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setEditingId(u.id)}>Update</button>
                  <button type="button" className="btn btn-danger btn-small" disabled={u.id === me.id} onClick={() => remove(u)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
