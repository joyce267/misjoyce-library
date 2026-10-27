import { createContext, useContext, useEffect, useState } from 'react';

const LibraryContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export function LibraryProvider({ children }) {
const [books, setBooks] = useState([]);
const [users, setUsers] = useState([]);
const [tx, setTx] = useState([]);
const [session, setSession] = useState(() => {
try {
return JSON.parse(localStorage.getItem('tclib_session')) || null;
} catch {
return null;
}
});
const [loading, setLoading] = useState(true);
const [apiError, setApiError] = useState('');

const refreshBooks = async () => {
const response = await fetch(`${API_URL}/books`);

if (!response.ok) throw new Error('Could not load books.');
const data = await response.json();
setBooks(data);
return data;
};

const refreshUsers = async () => {
const response = await fetch('${API_URL}/users');
if (!response.ok) throw new Error('Could not load members.');
const data = await response.json();
setUsers(data);
return data;
};

const refreshTransactions = async () => {
const response = await fetch('${API_URL}/transactions');
if (!response.ok) throw new Error('Could not load transactions.');
const data = await response.json();
setTx(data);
return data;
};

useEffect(() => {
let active = true;

async function loadData() {
  try {
    const [bookResponse, userResponse, txResponse] = await Promise.all([
      fetch(`${API_URL}/books`),
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/transactions`)
    ]);

    if (!bookResponse.ok || !userResponse.ok || !txResponse.ok) {
      throw new Error('The library data could not be loaded from the server.');
    }

    const [bookData, userData, txData] = await Promise.all([
      bookResponse.json(),
      userResponse.json(),
      txResponse.json()
    ]);

    if (active) {
      setBooks(bookData);
      setUsers(userData);
      setTx(txData);
      setApiError('');
    }
  } catch (error) {
    if (active) {
      setApiError(error.message || 'Could not connect to the library server.');
    }
  } finally {
    if (active) setLoading(false);
  }
}

loadData();

return () => {
  active = false;
};

}, []);

useEffect(() => {
localStorage.setItem('tclib_session', JSON.stringify(session));
}, [session]);

const user = session
? users.find(u => String(u.id) === String(session.userId)) || null
: null;

const value = {
books, setBooks,
users, setUsers,
tx, setTx,
session, setSession,
user,
loading,
apiError,
refreshBooks,
refreshUsers,
refreshTransactions,
API_URL
};

return (
<LibraryContext.Provider value={value}>
{children}
</LibraryContext.Provider>
);
}

export const useLibrary = () => useContext(LibraryContext);