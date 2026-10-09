import { useLibrary } from '../context/LibraryContext.jsx';
import EmptyState from './EmptyState.jsx';

export default function TxLog() {
  const { tx } = useLibrary();
  const sorted = [...tx].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sorted.length === 0) return <EmptyState text="No transactions recorded yet." />;

  return (
    <ul className="tx-log">
      {sorted.map(t => (
        <li key={t.id}>
          <span className="tx-time">{new Date(t.date).toLocaleString()}</span>
          <span className="tx-desc">
            <strong>{t.bookTitle}</strong>
            {t.type === 'add' ? ` — ${t.qty} added by ${t.byName}` : ` — ${t.qty} borrowed, logged by ${t.byName}`}
            {t.note ? <span>{` (${t.note})`}</span> : null}
          </span>
          <span className={'tx-tag ' + t.type}>{t.type === 'add' ? 'Stock in' : 'Borrowed'}</span>
        </li>
      ))}
    </ul>
  );
}
