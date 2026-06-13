const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all accounts for user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get total balance (sum of all accounts)
router.get('/balance/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = ? AND is_active = TRUE';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total_balance: results[0].total_balance });
  });
});

// Create account
router.post('/', (req, res) => {
  const { user_id, account_name, account_type, bank_name, balance, color_code } = req.body;
  
  if (!user_id || !account_name || !account_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO accounts (user_id, account_name, account_type, bank_name, balance, color_code) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [user_id, account_name, account_type, bank_name || null, balance || 0, color_code || '#3498db'], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ 
      message: 'Account created successfully',
      accountId: results.insertId 
    });
  });
});

// Update account
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { account_name, balance, color_code } = req.body;

  const query = 'UPDATE accounts SET account_name = ?, balance = ?, color_code = ? WHERE id = ?';
  
  db.query(query, [account_name, balance, color_code, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Account updated successfully' });
  });
});

// Delete account
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM accounts WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Account deleted successfully' });
  });
});

module.exports = router;