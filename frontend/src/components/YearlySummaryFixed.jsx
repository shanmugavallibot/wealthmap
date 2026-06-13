import { useState, useEffect } from 'react';
import { budgetAPI, authAPI, transactionAPI } from '../services/api';
import '../styles/yearly-summary.css';

function YearlySummaryFixed({ userId }) {
  const [yearlyData, setYearlyData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYearlyData();
  }, [userId]);

  const fetchYearlyData = async () => {
    try {
      // Fetch user profile
      const userRes = await authAPI.getProfile(userId);
      setUser(userRes.data);

      // Fetch all transactions
      const transRes = await transactionAPI.getTransactions(userId);
      setYearlyData(transRes.data);
    } catch (err) {
      console.error('Failed to fetch yearly data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading yearly summary...</div>;
  if (!user) return <div>No user data available</div>;

  const currentYear = new Date().getFullYear();

  // Calculate yearly totals from transactions
  const yearlyTransactions = yearlyData ? yearlyData.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === currentYear;
  }) : [];

  // Yearly income = monthly_income x 12
  const monthlyIncome = parseFloat(user.monthly_income) || 0;
  const yearlyIncome = monthlyIncome * 12;

  // Yearly expense = sum of all expenses for the year
  const yearlyExpense = yearlyTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Balance = yearly income - yearly expenses
  const balance = yearlyIncome - yearlyExpense;

  // Yearly budget = monthly_budget x 12
  const monthlyBudget = parseFloat(user.monthly_budget) || 0;
  const yearlyBudget = monthlyBudget * 12;

  // Budget remaining = actual budget - yearly expense
  const budgetRemaining = yearlyBudget - yearlyExpense;

  // Calculate percentages
  const budgetPercentage = yearlyBudget > 0 ? (yearlyExpense / yearlyBudget) * 100 : 0;
  const expensePercentage = yearlyIncome > 0 ? (yearlyExpense / yearlyIncome) * 100 : 0;

  const budgetStatus = yearlyExpense > yearlyBudget ? 'Over Budget' : 'Within Budget';
  const statusColor = yearlyExpense > yearlyBudget ? '#FF6F00' : '#00C853';

  return (
    <div className="yearly-summary-card">
      <div className="yearly-header">
        <h2>📊 Yearly Summary (Per Annum) - {currentYear}</h2>
        <span className="budget-status" style={{ color: statusColor }}>
          {budgetStatus}
        </span>
      </div>

      <div className="yearly-grid">
        {/* Row 1 - Main Metrics */}
        <div className="yearly-item">
          <label>Yearly Income</label>
          <div className="amount income">₹{yearlyIncome.toLocaleString()}</div>
          <div className="subtext">Monthly ₹{monthlyIncome.toLocaleString()} × 12</div>
        </div>

        <div className="yearly-item">
          <label>Yearly Expense</label>
          <div className="amount expense">₹{yearlyExpense.toLocaleString()}</div>
          <div className="subtext">YTD Actual</div>
        </div>

        <div className="yearly-item">
          <label>Balance</label>
          <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            ₹{balance.toLocaleString()}
          </div>
          <div className="subtext">Income - Expense</div>
        </div>

        {/* Row 2 - Budget Metrics */}
        <div className="yearly-item">
          <label>Yearly Budget</label>
          <div className="amount budget">₹{yearlyBudget.toLocaleString()}</div>
          <div className="subtext">Monthly ₹{monthlyBudget.toLocaleString()} × 12</div>
        </div>

        <div className="yearly-item">
          <label>Budget Remaining</label>
          <div className={`amount ${budgetRemaining >= 0 ? 'positive' : 'negative'}`}>
            ₹{budgetRemaining.toLocaleString()}
          </div>
          <div className="subtext">Budget - Expense</div>
        </div>

        <div className="yearly-item">
          <label>Budget Used</label>
          <div className="amount">{budgetPercentage.toFixed(1)}%</div>
          <div className="subtext">of yearly budget</div>
        </div>

        {/* Row 3 - Monthly Averages */}
        <div className="yearly-item">
          <label>Avg Monthly Income</label>
          <div className="amount income">₹{Math.round(monthlyIncome).toLocaleString()}</div>
          <div className="subtext">Planned monthly</div>
        </div>

        <div className="yearly-item">
          <label>Avg Monthly Expense</label>
          <div className="amount expense">₹{Math.round(yearlyExpense / 12).toLocaleString()}</div>
          <div className="subtext">Actual average</div>
        </div>

        <div className="yearly-item">
          <label>Avg Monthly Savings</label>
          <div className={`amount ${(monthlyIncome - (yearlyExpense / 12)) >= 0 ? 'positive' : 'negative'}`}>
            ₹{Math.round(monthlyIncome - (yearlyExpense / 12)).toLocaleString()}
          </div>
          <div className="subtext">Average per month</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <label>Budget Progress</label>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="progress-info">
          {budgetPercentage.toFixed(1)}% of ₹{yearlyBudget.toLocaleString()} budget used
        </div>
      </div>

      {/* Breakdown */}
      <div className="yearly-breakdown">
        <h3>💡 Quick Insights</h3>
        <ul>
          <li>
            <strong>Savings Rate:</strong> {yearlyIncome > 0 ? ((balance / yearlyIncome) * 100).toFixed(1) : '0'}% 
            {yearlyIncome > 0 && ((balance / yearlyIncome) * 100) > 30 ? ' 🎉 Excellent!' : ''}
          </li>
          <li>
            <strong>Expense Rate:</strong> {expensePercentage.toFixed(1)}% of yearly income
          </li>
          <li>
            <strong>Monthly Sustainability:</strong> You can save ₹{Math.round(monthlyIncome - (yearlyExpense / 12)).toLocaleString()} every month
          </li>
          {budgetRemaining < 0 && (
            <li style={{ color: '#FF6F00' }}>
              <strong>⚠️ Over Budget:</strong> You've exceeded your budget by ₹{Math.abs(budgetRemaining).toLocaleString()}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default YearlySummaryFixed;