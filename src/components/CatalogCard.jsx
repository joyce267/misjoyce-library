import { LOW_STOCK_THRESHOLD } from '../storage.js';

export default function CatalogCard({ book: b }) {
  const isLow = b.quantity < LOW_STOCK_THRESHOLD;
  return (
    <div className={'catalog-card' + (isLow ? ' low' : '')}>
      <div className="genre-tab">{b.genre || 'Uncategorized'}</div>
      <h3>{b.title}</h3>
      <div className="author">{b.author}</div>
      <div className="isbn mono">{'ISBN ' + b.isbn}</div>
      <div className="qty-row">
        <div>
          <div className="qty-count">{String(b.quantity)}</div>
          <div className="qty-label">{b.quantity === 1 ? 'copy in stock' : 'copies in stock'}</div>
        </div>
        {isLow && <span className="stamp">{b.quantity === 0 ? 'Out of stock' : 'Low stock'}</span>}
      </div>
    </div>
  );
}
