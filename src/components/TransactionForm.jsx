import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import { uid, byTitle } from '../storage.js';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

export default function TransactionForm({ canAddStock }) {
  const { books, setBooks, tx, setTx, user } = useLibrary();
  const defaultType = canAddStock ? 'add' : 'borrow';
  const [bookId, setBookId] = useState('');
  const [type, setType] = useState(defaultType);
  const [qty, setQty] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const sorted = [...books].sort(byTitle);

  if (sorted.length === 0) {
    return (
      <div className="panel">
        <h2>New transaction</h2>
        <p>Add a book first before recording transactions.</p>
      </div>
    );
  }

  // Like a native <select>, fall back to the first book if none is chosen.
  const selectedId = sorted.some(b => b.id === bookId) ? bookId : sorted[0].id;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(qty, 10);

    if (!selectedId || isNaN(amount) || amount < 1) {
      setError('Choose a book and enter a quantity of at least 1.');
      return;
    }
    const book = books.find(b => b.id === selectedId);
    if (!book) return;

    if (type === 'borrow' && book.quantity < amount) {
      setError(`Only ${book.quantity} cop${book.quantity === 1 ? 'y' : 'ies'} of "${book.title}" available to borrow.`);
      return;
    }

    setBooks(books.map(b => b.id === book.id ? { ...b, quantity: b.quantity + (type === 'add' ? amount : -amount) } : b));
    setTx([...tx, {
      id: uid('tx'), bookId: book.id, bookTitle: book.title, type, qty: amount,
      note: note.trim(), byName: user.name, date: new Date().toISOString()
    }]);

    setError('');
    setBookId('');
    setType(defaultType);
    setQty('1');
    setNote('');
  };

  return (
    <div className="panel">
      <h2>New transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field id="tx-book" label="Book">
            <select id="tx-book" required value={selectedId} onChange={e => setBookId(e.target.value)}>
              {sorted.map(b => <option key={b.id} value={b.id}>{`${b.title} (${b.quantity} in stock)`}</option>)}
            </select>
          </Field>
          <Field id="tx-type" label="Transaction type">
            <select id="tx-type" required value={type} onChange={e => setType(e.target.value)}>
              {canAddStock && <option value="add">Add stock — new books arrived</option>}
              <option value="borrow">Deduct stock — book borrowed</option>
            </select>
          </Field>
          <Field id="tx-qty" label="Quantity">
            <input type="number" id="tx-qty" min="1" step="1" required value={qty} onChange={e => setQty(e.target.value)} />
          </Field>
          <Field id="tx-note" label="Note">
            <input type="text" id="tx-note" placeholder="Optional note, e.g. borrower name" value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        </div>
        <FormError message={error} />
        <div className="form-actions">
          <button type="submit" className="btn">Record transaction</button>
        </div>
      </form>
    </div>
  );
}
