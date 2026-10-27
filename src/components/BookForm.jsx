import { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext.jsx';
import { uid } from '../storage.js';
import Field from './Field.jsx';
import FormError from './FormError.jsx';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '1' };

export default function BookForm({ editingId, setEditingId }) {
  const { books, setBooks } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    const book = books.find(b => b.id === editingId);
    if (book) {
      setForm({ title: book.title, author: book.author, genre: book.genre, isbn: book.isbn, quantity: String(book.quantity) });
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editingId]); 

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const title = form.title.trim();
  const author = form.author.trim();
  const genre = form.genre.trim();
  const isbn = form.isbn.trim();
  const quantity = Number(form.quantity);

  if (
    !title ||
    !author ||
    !genre ||
    !isbn ||
    form.quantity.trim() === '' ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    setError('Fill in every field with a valid, non-negative quantity.');
    return;
  }

  setError('');

  try {
    const url = editingId
      ? `http://localhost:5000/api/books/${editingId}`
      : 'http://localhost:5000/api/books';

    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        author,
        genre,
        isbn,
        quantity
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Could not save the book.');
      return;
    }

    const booksResponse = await fetch('http://localhost:5000/api/books');

    if (!booksResponse.ok) {
      setError('The book was saved, but the catalog could not refresh.');
      return;
    }

    const updatedBooks = await booksResponse.json();
    setBooks(updatedBooks);
    reset();
  } catch {
    setError('Could not connect to the server. Check that the backend is running.');
  }
};


  return (
    <div className="panel" id="bookFormPanel" ref={panelRef}>
      <h2>{editingId ? 'Update book details' : 'Add a new book'}</h2>
      <form noValidate onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field id="bf-title" label="Title">
            <input type="text" id="bf-title" required value={form.title} onChange={set('title')} />
          </Field>
          <Field id="bf-author" label="Author">
            <input type="text" id="bf-author" required value={form.author} onChange={set('author')} />
          </Field>
          <Field id="bf-genre" label="Genre">
            <input type="text" id="bf-genre" required value={form.genre} onChange={set('genre')} />
          </Field>
          <Field id="bf-isbn" label="ISBN">
            <input type="text" id="bf-isbn" className="mono" required value={form.isbn} onChange={set('isbn')} />
          </Field>
          <Field id="bf-qty" label="Initial quantity">
            <input type="number" id="bf-qty" min="0" step="1" required value={form.quantity} onChange={set('quantity')} />
          </Field>
        </div>
        <FormError message={error} />
        <div className="form-actions">
          <button type="submit" className="btn">{editingId ? 'Save changes' : 'Add book'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel edit</button>}
          {editingId && <span className="editing-flag">Editing existing title</span>}
        </div>
      </form>
    </div>
  );
}
