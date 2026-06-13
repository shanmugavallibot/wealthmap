import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import '../styles/prediction.css';

function PredictionCard({ userId }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrediction();
  }, [userId]);

  const fetchPrediction = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/predictions/next-month/${userId}`
    );

    if (!response.ok) {
      throw new Error('Prediction API not available');
    }

    const data = await response.json();
    setPrediction(data);
  } catch (err) {
    setError('Prediction feature not available');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="loading">Loading predictions...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!prediction) {
  return (
    <div className="card">
      <h3>🤖 AI Prediction</h3>
      <p>Prediction service is not configured yet.</p>
    </div>
  );
}

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthName = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="prediction-card">
      <div className="prediction-header">
        <h2>🤖 AI Prediction for {monthName}</h2>
        <span className="accuracy-badge">{prediction.accuracy.recommendation}</span>
      </div>

      <div className="prediction-content">
        <div className="prediction-section">
          <div className="prediction-item income">
            <div className="prediction-icon">💰</div>
            <div className="prediction-details">
              <label>Predicted Income</label>
              <div className="amount">₹{prediction.next_month.predicted_income.toLocaleString()}</div>
              <div className="meta">
                <span className={`trend ${prediction.next_month.income_trend}`}>
                  {prediction.next_month.income_trend === 'increasing' ? '📈' : '📉'} 
                  {prediction.next_month.income_trend}
                </span>
                <span className="confidence">
                  {prediction.next_month.income_confidence} confidence
                </span>
              </div>
            </div>
          </div>

          <div className="prediction-item expense">
            <div className="prediction-icon">💸</div>
            <div className="prediction-details">
              <label>Predicted Expense</label>
              <div className="amount">₹{prediction.next_month.predicted_expense.toLocaleString()}</div>
              <div className="meta">
                <span className={`trend ${prediction.next_month.expense_trend}`}>
                  {prediction.next_month.expense_trend === 'increasing' ? '📈' : '📉'} 
                  {prediction.next_month.expense_trend}
                </span>
                <span className="confidence">
                  {prediction.next_month.expense_confidence} confidence
                </span>
              </div>
            </div>
          </div>

          <div className="prediction-item savings">
            <div className="prediction-icon">💵</div>
            <div className="prediction-details">
              <label>Predicted Savings</label>
              <div className={`amount ${prediction.next_month.predicted_savings >= 0 ? 'positive' : 'negative'}`}>
                ₹{prediction.next_month.predicted_savings.toLocaleString()}
              </div>
              <div className="meta">
                {prediction.next_month.budget_status === 'over' && (
                  <span className="warning">⚠️ May exceed budget</span>
                )}
                {prediction.next_month.budget_status === 'within' && (
                  <span className="success">✅ Within budget</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="prediction-analysis">
          <h3>Analysis Based on Historical Data</h3>
          <div className="analysis-grid">
            <div className="analysis-item">
              <label>Avg Monthly Income</label>
              <div className="value">₹{prediction.historical.avg_income.toLocaleString()}</div>
            </div>
            <div className="analysis-item">
              <label>Avg Monthly Expense</label>
              <div className="value">₹{prediction.historical.avg_expense.toLocaleString()}</div>
            </div>
            <div className="analysis-item">
              <label>Months Analyzed</label>
              <div className="value">{prediction.historical.months_analyzed}</div>
            </div>
            <div className="analysis-item">
              <label>Expense Accuracy</label>
              <div className="value">{(prediction.accuracy.expense_r_squared * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="prediction-tips">
          <h3>💡 Smart Tips</h3>
          <ul>
            {prediction.next_month.expense_trend === 'increasing' && (
              <li>📈 Your expenses are increasing. Consider reducing discretionary spending.</li>
            )}
            {prediction.next_month.income_trend === 'decreasing' && (
              <li>📉 Your income trend is decreasing. Plan accordingly.</li>
            )}
            {prediction.next_month.budget_status === 'over' && (
              <li>⚠️ Predicted expense exceeds budget by ₹{Math.abs(prediction.next_month.budget_vs_prediction).toLocaleString()}</li>
            )}
            {prediction.next_month.predicted_savings > 0 && (
              <li>💰 You're projected to save ₹{prediction.next_month.predicted_savings.toLocaleString()} next month!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;