import { useState } from 'react';
import { goalsAPI } from '../services/api';
 
function GoalTracker({ userId, goals, onGoalAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: '',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      await goalsAPI.addGoal(
        userId,
        formData.goal_name,
        parseFloat(formData.target_amount),
        formData.target_date,
        formData.priority,
        formData.description
      );
 
      setFormData({
        goal_name: '',
        target_amount: '',
        target_date: '',
        priority: 'medium',
        description: ''
      });
      setShowForm(false);
      onGoalAdded();
    } catch (err) {
      console.error('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="card">
      <div className="goal-header">
        <h2>🎯 Financial Goals</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖️ Cancel' : '➕ Add Goal'}
        </button>
      </div>
 
      {showForm && (
        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              name="goal_name"
              value={formData.goal_name}
              onChange={handleChange}
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>
 
          <div className="form-group">
            <label>Target Amount (₹)</label>
            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              placeholder="0"
              step="1000"
              required
            />
          </div>
 
          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              required
            />
          </div>
 
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
 
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about your goal..."
              rows="3"
            ></textarea>
          </div>
 
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      )}
 
      <div className="goals-list">
        {goals.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No goals yet. Create one to start your financial journey!</p>
        ) : (
          goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));
 
            return (
              <div key={goal.id} className="goal-item">
                <div className="goal-title">
                  <h3>{goal.goal_name}</h3>
                  <span className={`priority priority-${goal.priority}`}>{goal.priority}</span>
                </div>
                
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="goal-stats">
                    <span>
                      ₹{Number(goal.current_amount || 0).toFixed(2)} /
                      ₹{Number(goal.target_amount || 0).toFixed(2)}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
 
                <div className="goal-meta">
                  <span>📅 {daysLeft > 0 ? `${daysLeft} days left` : 'Goal date reached'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
 
export default GoalTracker;
