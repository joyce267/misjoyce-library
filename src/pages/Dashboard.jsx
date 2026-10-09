import { useLibrary } from '../context/LibraryContext.jsx';
import { byTitle, LOW_STOCK_THRESHOLD } from '../storage.js';
import PageHead from '../components/PageHead.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CatalogCard from '../components/CatalogCard.jsx';

export default function Dashboard() {
  const { books } = useLibrary();
  const sorted = [...books].sort(byTitle);
  const lowCount = sorted.filter(b => b.quantity < LOW_STOCK_THRESHOLD).length;

  return (
    <section>
      <PageHead
        title="Current availability"
        text={`${sorted.length} titles in the catalog. ${lowCount} title${lowCount === 1 ? '' : 's'} running low (fewer than ${LOW_STOCK_THRESHOLD} copies).`}
      />
      {sorted.length === 0 ? (
        <EmptyState text="No books in the catalog yet. Add one from the Books page." />
      ) : (
        <div className="catalog-grid">
          {sorted.map(b => <CatalogCard key={b.id} book={b} />)}
        </div>
      )}
    </section>
  );
}
