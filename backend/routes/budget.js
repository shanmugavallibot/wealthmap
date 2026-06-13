const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get budget status for current month
router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // Get user budget
  const userQuery = 'SELECT monthly_budget FROM users WHERE id = ?';
  
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const monthlyBudget = userResults[0]?.monthly_budget || 0;

    // Get current month expenses
    const expenseQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_expense
      FROM transactions
      WHERE user_id = ? 
      AND transaction_type = 'expense'
      AND MONTH(date) = ? 
      AND YEAR(date) = ?
    `;

    db.query(expenseQuery, [userId, currentMonth, currentYear], (err, expenseResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const totalExpense = expenseResults[0].total_expense;
      const remaining = monthlyBudget - totalExpense;
      const percentageUsed = (totalExpense / monthlyBudget) * 100;

      res.json({
        monthYear,
        budget: monthlyBudget,
        spent: totalExpense,
        remaining,
        percentageUsed: Math.round(percentageUsed),
        isAlertTriggered: percentageUsed > 80, // Alert at 80%
        alertLevel: percentageUsed > 100 ? 'critical' : percentageUsed > 80 ? 'warning' : 'safe'
      });
    });
  });
});

// Get monthly breakdown (last 12 months)
router.get('/monthly/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, '0')) as month_year,
      MONTH(date) as month,
      YEAR(date) as year,
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY year DESC, month DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get user budget
    const budgetQuery = 'SELECT monthly_budget FROM users WHERE id = ?';
    db.query(budgetQuery, [userId], (err, budgetResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const monthlyBudget = budgetResults[0]?.monthly_budget || 0;

      // Add budget comparison and alert status
      const monthlyData = results.map(month => ({
        month_year: month.month_year,
        month: month.month,
        year: month.year,
        total_income: parseFloat(month.total_income),
        total_expense: parseFloat(month.total_expense),
        net_savings: parseFloat(month.total_income) - parseFloat(month.total_expense),
        budget: monthlyBudget,
        budget_remaining: monthlyBudget - parseFloat(month.total_expense),
        budget_percentage: Math.round((parseFloat(month.total_expense) / monthlyBudget) * 100),
        isOverBudget: parseFloat(month.total_expense) > monthlyBudget,
        alertLevel: 
          (parseFloat(month.total_expense) > monthlyBudget * 1.1) ? 'critical' :
          (parseFloat(month.total_expense) > monthlyBudget) ? 'warning' :
          (parseFloat(month.total_expense) > monthlyBudget * 0.8) ? 'caution' : 'safe'
      }));

      res.json(monthlyData);
    });
  });
});

// Get yearly breakdown
router.get('/yearly/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      YEAR(date) as year,
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY YEAR(date)
    ORDER BY year DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get user budget
    const budgetQuery = 'SELECT monthly_budget FROM users WHERE id = ?';
    db.query(budgetQuery, [userId], (err, budgetResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const monthlyBudget = budgetResults[0]?.monthly_budget || 0;
      const yearlyBudget = monthlyBudget * 12;

      // Calculate yearly metrics
const yearlyData = results.map(year => {
  const monthlyIncome = parseFloat(year.total_income) || 0;
  const totalExpense = parseFloat(year.total_expense) || 0;

  const yearlyIncome = monthlyIncome * 12;
  const netSavings = yearlyIncome - totalExpense;

  return {
    year: year.year,

    // Monthly income × 12
    total_income: yearlyIncome,

    total_expense: totalExpense,

    // Yearly income - total expenses
    net_savings: netSavings,

    yearly_budget: yearlyBudget,

    // Budget - expenses
    budget_remaining: yearlyBudget - totalExpense,

    budget_percentage:
      yearlyBudget > 0
        ? Math.round((totalExpense / yearlyBudget) * 100)
        : 0,

    isOverBudget: totalExpense > yearlyBudget,

    avg_monthly_expense: Math.round(totalExpense / 12),

    // Show actual monthly income
    avg_monthly_income: monthlyIncome
  };
});

      res.json(yearlyData);
    });
  });
});

// Get budget alerts
router.get('/alerts/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 10;

  const query = `
    SELECT * FROM budget_alerts 
    WHERE user_id = ? 
    ORDER BY month_year DESC 
    LIMIT ?
  `;

  db.query(query, [userId, parseInt(limit)], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get current month alert
router.get('/current-alert/:userId', (req, res) => {
  const { userId } = req.params;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // Get user budget
  const userQuery = 'SELECT monthly_budget FROM users WHERE id = ?';
  
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const monthlyBudget = userResults[0]?.monthly_budget || 0;

    // Get current month expenses
    const expenseQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_expense
      FROM transactions
      WHERE user_id = ? 
      AND transaction_type = 'expense'
      AND MONTH(date) = ? 
      AND YEAR(date) = ?
    `;

    db.query(expenseQuery, [userId, currentMonth, currentYear], (err, expenseResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const totalExpense = expenseResults[0].total_expense;
      const percentageUsed = (totalExpense / monthlyBudget) * 100;

      if (percentageUsed > 80) {
        const alertMessage = 
          percentageUsed > 100 ? 
            `🚨 CRITICAL: You've exceeded your budget by ₹${(totalExpense - monthlyBudget).toFixed(2)}!` :
            `⚠️ WARNING: You've used ${percentageUsed.toFixed(1)}% of your monthly budget (₹${totalExpense.toFixed(2)} / ₹${monthlyBudget.toFixed(2)})`;

        res.json({
          hasAlert: true,
          monthYear,
          budget: monthlyBudget,
          spent: totalExpense,
          percentageUsed: Math.round(percentageUsed),
          alertLevel: percentageUsed > 100 ? 'critical' : 'warning',
          message: alertMessage,
          remaining: monthlyBudget - totalExpense
        });
      } else {
        res.json({
          hasAlert: false,
          monthYear,
          budget: monthlyBudget,
          spent: totalExpense,
          percentageUsed: Math.round(percentageUsed),
          alertLevel: 'safe',
          message: `✅ You're within budget! (${percentageUsed.toFixed(1)}% used)`,
          remaining: monthlyBudget - totalExpense
        });
      }
    });
  });
});

module.exports = router;