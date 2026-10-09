import { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import { uid } from '../storage.js';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

const EMPTY = { name: '', membershipId: '', role: 'member', password: '' };

export default function UserForm({ editingId, setEditingId }) {
  const { users, setUsers } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    const u = users.find(x => x.id === editingId);
    if (u) {
      setForm({ name: u.name, membershipId: u.membershipId, role: u.role, password: u.password });
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const membershipId = form.membershipId.trim();
    const { role, password } = form;

    if (!name || !membershipId || !password) {
      setError('Fill in name, membership ID, and password.');
      return;
    }
    const clash = users.find(u => u.membershipId.toLowerCase() === membershipId.toLowerCase() && u.id !== editingId);
    if (clash) {
      setError('That membership ID is already in use.');
      return;
    }

    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, name, membershipId, role, password } : u));
    } else {
      setUsers([...users, { id: uid('usr'), name, membershipId, role, password }]);
    }
    reset();
  };

  return (
    <div className="panel" id="userFormPanel" ref={panelRef}>
      <h2>{editingId ? 'Update member details' : 'Add a new member'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field id="uf-name" label="Name">
            <input type="text" id="uf-name" required value={form.name} onChange={set('name')} />
          </Field>
          <Field id="uf-mid" label="Membership ID">
            <input type="text" id="uf-mid" className="mono" required value={form.membershipId} onChange={set('membershipId')} />
          </Field>
          <Field id="uf-role" label="Role">
            <select id="uf-role" required value={form.role} onChange={set('role')}>
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
            </select>
          </Field>
          <Field id="uf-pass" label="Password">
            <input type="text" id="uf-pass" className="mono" required value={form.password} onChange={set('password')} />
          </Field>
        </div>
        <FormError message={error} />
        <div className="form-actions">
          <button type="submit" className="btn">{editingId ? 'Save changes' : 'Add member'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel edit</button>}
          {editingId && <span className="editing-flag">Editing existing member</span>}
        </div>
      </form>
    </div>
  );
}
