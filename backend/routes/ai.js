const express = require('express');
const router = express.Router();
const db = require('../config/db');
 
// Get AI insights for a user
router.get('/insights/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM ai_insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 10';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});
 
// Get financial roadmap data
router.get('/roadmap/:userId', (req, res) => {
  const { userId } = req.params;
 
  // Get goals with progress
  const goalsQuery = 'SELECT id, goal_name, target_amount, current_amount, target_date FROM goals WHERE user_id = ? ORDER BY target_date ASC';
  
  db.query(goalsQuery, [userId], (err, goals) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    // Get monthly savings
    const savingsQuery = `
      SELECT month_year, net_savings FROM monthly_summary 
      WHERE user_id = ? 
      ORDER BY month_year DESC 
      LIMIT 12
    `;
 
    db.query(savingsQuery, [userId], (err, savings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
 
      res.json({
        goals,
        monthly_savings: savings
      });
    });
  });
});
 
module.exports = router;