import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import '../styles/MonthlySummary.css';

function MonthlySummary({ userId }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, [userId]);

  const fetchMonthlyData = async () => {
    try {
      const response = await budgetAPI.getMonthly(userId);
      setMonthlyData(response.data);
    } catch (err) {
      console.error('Failed to fetch monthly data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>📅 Monthly Summary (Last 12 Months)</h2>
      
      {monthlyData.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No data available</p>
      ) : (
        <div className="monthly-table">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Budget</th>
                <th>Remaining</th>
                <th>Used %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => (
                <tr key={month.month_year} className={`status-${month.alertLevel}`}>
                  <td><strong>{month.month_year}</strong></td>
                  <td>₹{Number(month.total_income || 0).toFixed(2)}</td>
                  <td>₹{Number(month.total_expense || 0).toFixed(2)}</td>
                  <td>₹{Number(month.budget || 0).toFixed(2)}</td>
                  <td 
                    style={{ 
                      color: month.budget_remaining < 0 ? '#ef4444' : '#10b981' 
                    }}
                  >
                    ₹{month.budget_remaining.toFixed(2)}
                  </td>
                  <td>
                    <div className="progress-small">
                      <div 
                        className="progress-fill-small" 
                        style={{ width: `${Math.min(month.budget_percentage, 100)}%` }}
                      ></div>
                    </div>
                    {month.budget_percentage}%
                  </td>
                  <td>
                    {month.alertLevel === 'critical' && '🚨 Critical'}
                    {month.alertLevel === 'warning' && '⚠️ Over Budget'}
                    {month.alertLevel === 'caution' && '⚡ Caution'}
                    {month.alertLevel === 'safe' && '✅ Safe'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MonthlySummary;