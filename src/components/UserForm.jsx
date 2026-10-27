import { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

const EMPTY = { name: '', membershipId: '', role: 'member', password: '' };

export default function UserForm({ editingId, setEditingId }) {
  const { users, setUsers } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
  const u = users.find(x => String(x.id) === String(editingId));

  if (u) {
    setForm({
      name: u.name,
      membershipId: u.membershipId,
      role: u.role,
      password: ''
    });

    panelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  } else {
    setForm(EMPTY);
  }

  setError('');
}, [editingId, users]);
const set = (field) => (e) =>
  setForm({ ...form, [field]: e.target.value });

const reset = () => {
  setEditingId(null);
  setForm(EMPTY);
  setError('');
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const name = form.name.trim();
  const membershipId = form.membershipId.trim();
  const { role, password } = form;

  if (!name || !membershipId || (!editingId && !password)) {
    setError(
      editingId
        ? 'Fill in name and membership ID.'
        : 'Fill in name, membership ID, and password.'
    );
    return;
  }

  if (password && password.length < 8) {
    setError('Password must contain at least 8 characters.');
    return;
  }

  const clash = users.find(
    u =>
      u.membershipId?.toLowerCase() === membershipId.toLowerCase() &&
      String(u.id) !== String(editingId)
  );

  if (clash) {
    setError('That membership ID is already in use.');
    return;
  }

  setError('');

  try {
    const url = editingId
      ? `http://localhost:5000/api/users/${editingId}`
      : 'http://localhost:5000/api/users';

    const body = { name, membershipId, role };

    if (password) {
      body.password = password;
    }

    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Could not save the member.');
      return;
    }

    const usersResponse = await fetch('http://localhost:5000/api/users');

    if (!usersResponse.ok) {
      setError('Member saved, but the member list could not refresh.');
      return;
    }

    setUsers(await usersResponse.json());
    reset();
  } catch {
    setError('Could not connect to the server. Check that the backend is running.');
  }
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
  <input
    type="password"
    id="uf-pass"
    className="mono"
    required={!editingId}
    autoComplete="new-password"
    placeholder={
      editingId
        ? 'Leave blank to keep current password'
        : 'At least 8 characters'
    }
    value={form.password}
    onChange={set('password')}
  />
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
