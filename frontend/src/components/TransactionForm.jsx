import { useState } from 'react';
import { transactionAPI } from '../services/api';
import './TransactionForm.css';
 
function TransactionForm({ userId, onSuccess }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
 
  const categories = {
    expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other']
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      await transactionAPI.addTransaction(
        userId,
        formData.category,
        parseFloat(formData.amount),
        formData.type,
        formData.description,
        formData.date
      );
 
      setMessage('✅ Transaction added successfully');
      setFormData({
        category: '',
        amount: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
 
      setTimeout(() => setMessage(''), 2000);
      onSuccess();
    } catch (err) {
      setMessage('❌ Failed to add transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="card">
      <h2>➕ Add Transaction</h2>
      
      {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}
 
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
 
        <div className="form-group">
          <label>Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            {categories[formData.type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
 
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            step="0.01"
            required
          />
        </div>
 
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
 
        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add notes..."
            rows="3"
          ></textarea>
        </div>
 
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}
 
export default TransactionForm;
 