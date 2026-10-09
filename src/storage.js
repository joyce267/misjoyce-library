/* Local storage keys (same as the original project) and seed data. */
export const KEYS = { books: 'tclib_books', users: 'tclib_users', tx: 'tclib_transactions', session: 'tclib_session' };
export const LOW_STOCK_THRESHOLD = 2;

export const uid = (prefix) => prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const byTitle = (a, b) => a.title.localeCompare(b.title);

export const seedUsers = () => [
  { id: uid('usr'), name: 'Naledi Mokoena', membershipId: 'LIB-001', role: 'librarian', password: 'library2024' },
  { id: uid('usr'), name: 'Thabo Sekonyela', membershipId: 'MEM-014', role: 'member', password: 'member2024' }
];

export const seedBooks = () => [
  { id: uid('bk'), title: 'Lords of Finance', author: 'Liaquat Ahamed', genre: 'Economic History', isbn: '9871594201820', quantity: 13 },
  { id: uid('bk'), title: 'Long Walk to Freedom', author: 'Nelson Mandela', genre: 'Biography', isbn: '9780316548182', quantity: 9 },
  { id: uid('bk'), title: 'Sefela sa Basotho', author: 'Z. D. Mangoaela', genre: 'Poetry', isbn: '9780869800012', quantity: 7 },
  { id: uid('bk'), title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', isbn: '9780062316097', quantity: 16 },
  { id: uid('bk'), title: 'The Famished Road', author: 'Ben Okri', genre: 'Fiction', isbn: '9780385425131', quantity: 8 }
];
