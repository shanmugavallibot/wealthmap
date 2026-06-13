import axios from 'axios';
 
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
export const authAPI = {
  register: (username, email, password, income, budget) =>
    api.post('/auth/register', { username, email, password, monthly_income: income, monthly_budget: budget }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: (userId) =>
    api.get(`/auth/profile/${userId}`),
};
 
export const transactionAPI = {
  getTransactions: (userId, month, year) =>
    api.get(`/transactions/${userId}`, { params: { month, year } }),
  
  addTransaction: (userId, category, amount, type, description, date) =>
    api.post('/transactions', { user_id: userId, category, amount, transaction_type: type, description, date }),
  
  deleteTransaction: (transactionId) =>
    api.delete(`/transactions/${transactionId}`),
};
 
export const goalsAPI = {
  getGoals: (userId) =>
    api.get(`/goals/${userId}`),
  
  addGoal: (userId, goalName, targetAmount, targetDate, priority, description) =>
    api.post('/goals', { user_id: userId, goal_name: goalName, target_amount: targetAmount, target_date: targetDate, priority, description }),
  
  updateGoal: (goalId, currentAmount) =>
    api.put(`/goals/${goalId}`, { current_amount: currentAmount }),
};
 
export const aiAPI = {
  getInsights: (userId) =>
    api.get(`/ai/insights/${userId}`),
  
  getRoadmap: (userId) =>
    api.get(`/ai/roadmap/${userId}`),
};
 
export default api;