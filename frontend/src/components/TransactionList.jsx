import { transactionAPI } from '../services/api';
 
function TransactionList({ transactions, onDelete }) {
  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.deleteTransaction(transactionId);
        onDelete();
      } catch (err) {
        console.error('Failed to delete transaction');
      }
    }
  };
 
  return (
    <div className="card">
      <h2>📋 Recent Transactions</h2>
      
      {transactions.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No transactions yet. Add one to get started!</p>
      ) : (
        <div className="transaction-list">
          {transactions.slice(0, 10).map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-category">
                  {transaction.category}
                </div>
                <div className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.transaction_type}`}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                </span>
                <button 
                  onClick={() => handleDelete(transaction.id)}
                  className="btn-delete"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
export default TransactionList;