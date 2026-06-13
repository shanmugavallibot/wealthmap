import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Auth.css';
 
function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    monthly_income: '',
    monthly_budget: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
 
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
 
    setLoading(true);
 
    try {
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
        parseFloat(formData.monthly_income) || 0,
        parseFloat(formData.monthly_budget) || 0
      );
 
      // Auto login after registration
      const loginResponse = await authAPI.login(formData.email, formData.password);
      const { token, user } = loginResponse.data;
      
      onLogin(user.id, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 WealthMap</h1>
          <p>Your AI Financial Planning Assistant</p>
        </div>
 
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Your Account</h2>
 
          {error && <div className="alert alert-error">{error}</div>}
 
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="monthly_income">Monthly Income (₹)</label>
            <input
              type="number"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              placeholder="0"
              step="1000"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="monthly_budget">Monthly Budget (₹)</label>
            <input
              type="number"
              id="monthly_budget"
              name="monthly_budget"
              value={formData.monthly_budget}
              onChange={handleChange}
              placeholder="0"
              step="1000"
            />
          </div>
 
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
 
          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
 
export default Register;