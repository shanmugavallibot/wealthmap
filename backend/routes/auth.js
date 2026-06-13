const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
 
// Register
router.post('/register', (req, res) => {
  const { username, email, password, monthly_income, monthly_budget } = req.body;
 
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password required' });
  }
 
  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }
 
    const query = 'INSERT INTO users (username, email, password_hash, monthly_income, monthly_budget) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [username, email, hashedPassword, monthly_income || 0, monthly_budget || 0], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
 
      res.status(201).json({ 
        message: 'User registered successfully',
        userId: results.insertId 
      });
    });
  });
});
 
// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
 
  const query = 'SELECT * FROM users WHERE email = ?';
  
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
 
    const user = results[0];
 
    bcrypt.compare(password, user.password_hash, (err, isPasswordValid) => {
      if (err) {
        return res.status(500).json({ error: 'Password comparison error' });
      }
 
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
 
      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
 
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          monthly_income: user.monthly_income,
          monthly_budget: user.monthly_budget
        }
      });
    });
  });
});
 
// Get user profile
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT id, username, email, monthly_income, monthly_budget, created_at FROM users WHERE id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
 
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    res.json(results[0]);
  });
});
 
module.exports = router;