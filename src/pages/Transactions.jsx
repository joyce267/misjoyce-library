import { useLibrary } from '../context/LibraryContext.jsx';
import PageHead from '../components/PageHead.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TxLog from '../components/TxLog.jsx';

export default function Transactions() {
  const { user } = useLibrary();
  const canAddStock = user.role === 'librarian';

  return (
    <section>
      <PageHead
        title="Stock transactions"
        text={canAddStock
          ? 'Record new stock arriving, or deduct copies when a book is borrowed.'
          : 'Record a book being borrowed. Adding new stock is handled by a librarian.'}
      />
      <TransactionForm canAddStock={canAddStock} />
      <hr className="section-divider" />
      <h2>Transaction history</h2>
      <TxLog />
    </section>
  );
}
