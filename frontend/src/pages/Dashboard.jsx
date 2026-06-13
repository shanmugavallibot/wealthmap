import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import GoalTracker from '../components/GoalTracker';
import ExpenseChart from '../components/ExpenseChart';
import AIInsights from '../components/AIInsights';
import BudgetAlert from '../components/BudgetAlert';
import MonthlySummary from '../components/MonthlySummary';
import YearlySummary from '../components/YearlySummary';
import { transactionAPI, goalsAPI, authAPI } from '../services/api';
import PredictionCard from '../components/PredictionCard';
import YearlySummaryFixed from '../components/YearlySummaryFixed';
import '../styles/Dashboard.css';
 
function Dashboard() {
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchData();
  }, [userId]);
 
  const fetchData = async () => {
  try {
    setLoading(true);

    const userRes = await authAPI.getProfile(userId);
    setUser(userRes.data);

    const transRes = await transactionAPI.getTransactions(userId);
    setTransactions(transRes.data);

    const goalsRes = await goalsAPI.getGoals(userId);
    setGoals(goalsRes.data);

  } catch (err) {
    setError('Failed to load data');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// ADD THESE FUNCTIONS HERE

const handleTransactionAdded = async () => {
  await fetchData();
};

const handleGoalAdded = async () => {
  await fetchData();
};

const handleLogout = () => {
  localStorage.removeItem('userId');
  navigate('/login');
};
 
  const calculateStats = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
 
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });
 
    const totalIncome = monthlyTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
 
    const totalExpense = monthlyTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
 
    const savings = totalIncome - totalExpense;
 
    return { totalIncome, totalExpense, savings };
  };
 
  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }
 
  const stats = calculateStats();
 
  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="dashboard-wrapper">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="dashboard-container">
          <div className="container dashboard">
            {error && <div className="alert alert-error">{error}</div>}
 
        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-box">
            <h3>Monthly Income</h3>
            <div className="amount">₹{stats.totalIncome.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <h3>Monthly Expenses</h3>
            <div className="amount">₹{stats.totalExpense.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <h3>Monthly Savings</h3>
            <div className="amount">₹{stats.savings.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <h3>Monthly Budget</h3>
            <div className="amount">₹{user?.monthly_budget || 0}</div>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💳 Transactions
          </button>
          <button 
            className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Goals
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            ✨ AI Insights
          </button>
          <button 
            className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
          💰 Budget Analysis
          </button>
          <button 
            className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
          📅 Monthly View
          </button>
          <button 
            className={`tab ${activeTab === 'yearly' ? 'active' : ''}`}
            onClick={() => setActiveTab('yearly')}
          >
          📊 Yearly View
          </button>
        </div>
 
        {/* Tab Content */}
       {activeTab === 'overview' && (
  <div className="tab-content">

    {/* Charts */}
    <div className="grid grid-2">
      <ExpenseChart transactions={transactions} />

    </div>

  </div>
)}
 
        {activeTab === 'transactions' && (
          <div className="tab-content">
            <div className="grid">
              <TransactionForm userId={userId} onSuccess={handleTransactionAdded} />
              <TransactionList transactions={transactions} onDelete={fetchData} />
            </div>
          </div>
        )}
 
        {activeTab === 'goals' && (
          <div className="tab-content">
            <GoalTracker userId={userId} goals={goals} onGoalAdded={handleGoalAdded} />
          </div>
        )}
 
        {activeTab === 'insights' && (
          <div className="tab-content">
            <AIInsights userId={userId} transactions={transactions} goals={goals} />
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="tab-content">
            <BudgetAlert userId={userId} />
          <div className="grid">
            <div className="card">
              <h2>Budget Status</h2>
            {/* Display alert info */}
            </div>
          </div>
        </div>
        )}

        {activeTab === 'monthly' && (
          <div className="tab-content">
            <MonthlySummary userId={userId} />
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className="tab-content">
            {/* <PredictionCard userId={userId} /> */}
            <YearlySummaryFixed userId={userId} />
            <PredictionCard userId={userId} />
          </div>
        )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
 