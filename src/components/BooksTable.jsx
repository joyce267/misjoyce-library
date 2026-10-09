import { useLibrary } from '../context/LibraryContext.jsx';
import { byTitle, LOW_STOCK_THRESHOLD } from '../storage.js';
import EmptyState from './EmptyState.jsx';

export default function BooksTable({ canManage, editingId, setEditingId }) {
  const { books, setBooks } = useLibrary();
  const sorted = [...books].sort(byTitle);

  if (sorted.length === 0) return <EmptyState text="No books yet." />;

  const remove = (b) => {
    if (!window.confirm(`Remove "${b.title}" from the catalog?`)) return;
    setBooks(books.filter(x => x.id !== b.id));
    if (editingId === b.id) setEditingId(null);
  };

  return (
    <div>
      <table className="ledger">
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th><th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map(b => {
            const isLow = b.quantity < LOW_STOCK_THRESHOLD;
            return (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.genre}</td>
                <td className="mono">{b.isbn}</td>
                <td className="mono">{String(b.quantity)}</td>
                <td>
                  <span className={isLow ? 'badge-low' : 'badge-ok'}>
                    {isLow ? (b.quantity === 0 ? 'Out of stock' : 'Low stock') : 'Available'}
                  </span>
                </td>
                {canManage && (
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setEditingId(b.id)}>Update</button>
                      <button type="button" className="btn btn-danger btn-small" onClick={() => remove(b)}>Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
