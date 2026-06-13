import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import '../styles/YearlySummary.css';

function YearlySummary({ userId }) {
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYearlyData();
  }, [userId]);

  const fetchYearlyData = async () => {
    try {
      const response = await budgetAPI.getYearly(userId);
      setYearlyData(response.data);
    } catch (err) {
      console.error('Failed to fetch yearly data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>📊 Yearly Summary (Per Annum)</h2>
      
      {yearlyData.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No data available</p>
      ) : (
        <div className="yearly-grid">
          {yearlyData.map((year) => (
            <div key={year.year} className={`yearly-card status-${year.isOverBudget ? 'warning' : 'safe'}`}>
              <div className="yearly-header">
                <h3>{year.year}</h3>
                {year.isOverBudget && <span className="badge-over">Over Budget</span>}
                {!year.isOverBudget && <span className="badge-ok">Within Budget</span>}
              </div>

              <div className="yearly-stats">
                <div className="stat">
                  <label>Total Income</label>
                  <div className="amount income">₹{year.total_income.toFixed(0)}</div>
                </div>

                <div className="stat">
                  <label>Total Expenses</label>
                  <div className="amount expense">₹{year.total_expense.toFixed(0)}</div>
                </div>

                <div className="stat">
                  <label>Net Savings</label>
                  <div className={`amount ${year.net_savings >= 0 ? 'positive' : 'negative'}`}>
                    ₹{year.net_savings.toFixed(0)}
                  </div>
                </div>

                <div className="stat">
                  <label>Yearly Budget</label>
                  <div className="amount budget">₹{year.yearly_budget.toFixed(0)}</div>
                </div>

                <div className="stat">
                  <label>Budget Remaining</label>
                  <div 
                    className={`amount ${year.budget_remaining >= 0 ? 'positive' : 'negative'}`}
                  >
                    ₹{year.budget_remaining.toFixed(0)}
                  </div>
                </div>

                <div className="stat">
                  <label>Avg Monthly Expense</label>
                  <div className="amount expense">₹{year.avg_monthly_expense.toFixed(0)}</div>
                </div>

                <div className="stat">
                  <label>Avg Monthly Income</label>
                  <div className="amount income">₹{year.avg_monthly_income.toFixed(0)}</div>
                </div>

                <div className="stat">
                  <label>Budget Used</label>
                  <div className="amount">{year.budget_percentage}%</div>
                </div>
              </div>

              <div className="progress-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${Math.min(year.budget_percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default YearlySummary;