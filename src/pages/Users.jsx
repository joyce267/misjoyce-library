import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHead from '../components/PageHead.jsx';
import UserForm from '../components/UserForm.jsx';
import UsersTable from '../components/UsersTable.jsx';

export default function Users() {
  const { user } = useLibrary();
  const [editingId, setEditingId] = useState(null);

  if (user.role !== 'librarian') {
    return <div className="notice error">You need librarian access to view member accounts.</div>;
  }

  return (
    <section>
      <PageHead title="Member accounts" text="Add new members, update their details, or remove an account." />
      <UserForm editingId={editingId} setEditingId={setEditingId} />
      <UsersTable editingId={editingId} setEditingId={setEditingId} />
    </section>
  );
}
