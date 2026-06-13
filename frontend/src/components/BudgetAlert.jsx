import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import '../styles/BudgetAlert.css';

function BudgetAlert({ userId }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlert();
    // Refresh alert every 5 minutes
    const interval = setInterval(fetchAlert, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchAlert = async () => {
    try {
      const response = await budgetAPI.getCurrentAlert(userId);
      setAlert(response.data);
    } catch (err) {
      console.error('Failed to fetch alert');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!alert) return null;

  return (
    <div className={`budget-alert alert-${alert.alertLevel}`}>
      <div className="alert-content">
        <div className="alert-icon">
          {alert.alertLevel === 'critical' && '🚨'}
          {alert.alertLevel === 'warning' && '⚠️'}
          {alert.alertLevel === 'safe' && '✅'}
        </div>
        <div className="alert-message">
          <h3>{alert.message}</h3>
          <p>
            <strong>Budget:</strong> ₹{Number(alert.budget || 0).toFixed(2)} | 
            <strong> Spent:</strong> ₹{Number(alert.spent || 0).toFixed(2)} | 
            <strong> Remaining:</strong> ₹{Number(alert.remaining || 0).toFixed(2)}
          </p>
          <div className="alert-bar">
            <div 
              className="alert-bar-fill" 
              style={{ width: `${Math.min(alert.percentageUsed, 100)}%` }}
            ></div>
          </div>
          <p className="alert-percentage">{Number(alert.percentageUsed || 0).toFixed(2)}% Used</p>
        </div>
      </div>
    </div>
  );
}

export default BudgetAlert;