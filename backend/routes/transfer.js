const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all transfers
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT t.*, 
    a1.account_name as from_account_name,
    a2.account_name as to_account_name
    FROM transfers t
    JOIN accounts a1 ON t.from_account_id = a1.id
    JOIN accounts a2 ON t.to_account_id = a2.id
    WHERE t.user_id = ?
    ORDER BY t.transfer_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Create transfer
router.post('/', (req, res) => {
  const { user_id, from_account_id, to_account_id, amount, transfer_date, description } = req.body;

  if (!user_id || !from_account_id || !to_account_id || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) throw err;

    // Deduct from source account
    const deductQuery = 'UPDATE accounts SET balance = balance - ? WHERE id = ?';
    db.query(deductQuery, [amount, from_account_id], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Transfer failed' });
        });
      }

      // Add to destination account
      const addQuery = 'UPDATE accounts SET balance = balance + ? WHERE id = ?';
      db.query(addQuery, [amount, to_account_id], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Transfer failed' });
          });
        }

        // Record transfer
        const transferQuery = 'INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, transfer_date, description) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(transferQuery, [user_id, from_account_id, to_account_id, amount, transfer_date, description], (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Transfer failed' });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: 'Transfer failed' });
              });
            }
            res.status(201).json({ 
              message: 'Transfer completed successfully',
              transferId: results.insertId 
            });
          });
        });
      });
    });
  });
});

module.exports = router;