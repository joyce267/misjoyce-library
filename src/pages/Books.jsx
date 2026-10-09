import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import PageHead from '../components/PageHead.jsx';
import BookForm from '../components/BookForm.jsx';
import BooksTable from '../components/BooksTable.jsx';

export default function Books() {
  const { user } = useLibrary();
  const canManage = user.role === 'librarian';
  const [editingId, setEditingId] = useState(null);

  return (
    <section>
      <PageHead
        title="Book management"
        text={canManage
          ? 'Add new titles, edit details, or remove books that are no longer available.'
          : 'Browse the full catalog. Ask a librarian to add, edit, or remove titles.'}
      />
      {canManage && <BookForm editingId={editingId} setEditingId={setEditingId} />}
      <BooksTable canManage={canManage} editingId={editingId} setEditingId={setEditingId} />
    </section>
  );
}
