const express = require('express');
const router = express.Router();
const db = require('../config/db');
 
// Get all transactions for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;
 
  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [userId];
 
  if (month && year) {
    query += ' AND MONTH(date) = ? AND YEAR(date) = ?';
    params.push(month, year);
  }
 
  query += ' ORDER BY date DESC';
 
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});
 
// Add new transaction
router.post('/', (req, res) => {
  const { user_id, category, amount, transaction_type, description, date } = req.body;
 
  if (!user_id || !category || !amount || !transaction_type || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
 
  const query = 'INSERT INTO transactions (user_id, category, amount, transaction_type, description, date) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [user_id, category, amount, transaction_type, description, date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    res.status(201).json({
      message: 'Transaction added successfully',
      transactionId: results.insertId
    });
  });
});
 
// Delete transaction
router.delete('/:transactionId', (req, res) => {
  const { transactionId } = req.params;
 
  const query = 'DELETE FROM transactions WHERE id = ?';
  
  db.query(query, [transactionId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
 
    res.json({ message: 'Transaction deleted successfully' });
  });
});
 
module.exports = router;
 