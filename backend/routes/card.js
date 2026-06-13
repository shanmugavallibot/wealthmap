const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all cards for user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT c.*, a.account_name 
    FROM cards c 
    JOIN accounts a ON c.account_id = a.id 
    WHERE c.user_id = ? 
    ORDER BY c.created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add card
router.post('/', (req, res) => {
  const { user_id, account_id, card_name, card_type, card_network, last_four_digits } = req.body;

  const query = 'INSERT INTO cards (user_id, account_id, card_name, card_type, card_network, last_four_digits) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [user_id, account_id, card_name, card_type, card_network, last_four_digits], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ 
      message: 'Card added successfully',
      cardId: results.insertId 
    });
  });
});

// Delete card
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cards WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Card deleted successfully' });
  });
});

module.exports = router;