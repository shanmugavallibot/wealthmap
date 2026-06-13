const express = require('express');
const router = express.Router();
const db = require('../config/db');
 
// Get all goals for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM goals WHERE user_id = ? ORDER BY target_date ASC';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});
 
// Add new goal
router.post('/', (req, res) => {
  const { user_id, goal_name, target_amount, target_date, priority, description } = req.body;
 
  if (!user_id || !goal_name || !target_amount || !target_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
 
  const query = 'INSERT INTO goals (user_id, goal_name, target_amount, target_date, priority, description) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [user_id, goal_name, target_amount, target_date, priority || 'medium', description], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    res.status(201).json({
      message: 'Goal created successfully',
      goalId: results.insertId
    });
  });
});
 
// Update goal progress
router.put('/:goalId', (req, res) => {
  const { goalId } = req.params;
  const { current_amount } = req.body;
 
  const query = 'UPDATE goals SET current_amount = ? WHERE id = ?';
  
  db.query(query, [current_amount, goalId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    res.json({ message: 'Goal updated successfully' });
  });
});
 
module.exports = router;
 