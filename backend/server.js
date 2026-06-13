const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
 
// Initialize Express app
const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Transaction routes
app.use('/api/transactions', require('./routes/transactions'));

// Goals routes
app.use('/api/goals', require('./routes/goals'));

// AI Insights routes
app.use('/api/ai', require('./routes/ai'));

// Budget & Analysis routes
app.use('/api/budget', require('./routes/budget'));

// Predictions routes
app.use('/api/predictions', require('./routes/predictions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
 
// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Health Check: http://localhost:${PORT}/api/health`);
});
