import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { KEYS, seedBooks, seedUsers } from '../storage.js';

const LibraryContext = createContext(null);

/* Shared data: books, users, transactions and the signed-in session. */
export function LibraryProvider({ children }) {
  const [books, setBooks] = useLocalStorage(KEYS.books, seedBooks);
  const [users, setUsers] = useLocalStorage(KEYS.users, seedUsers);
  const [tx, setTx] = useLocalStorage(KEYS.tx, []);
  const [session, setSession] = useLocalStorage(KEYS.session, null);

  const user = session ? users.find(u => u.id === session.userId) || null : null;

  const value = { books, setBooks, users, setUsers, tx, setTx, session, setSession, user };
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => useContext(LibraryContext);
