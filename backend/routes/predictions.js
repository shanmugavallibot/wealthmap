const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Simple ML: Linear Regression for trend prediction
function predictNextMonth(historicalData) {
  if (historicalData.length < 3) {
    // Not enough data, return average
    const avg = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
    return {
      prediction: avg,
      confidence: 0.4,
      method: 'average'
    };
  }

  // Linear Regression Formula
  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData;

  // Calculate means
  const xMean = x.reduce((a, b) => a + b) / n;
  const yMean = y.reduce((a, b) => a + b) / n;

  // Calculate slope (m) and intercept (b)
  // Line formula: y = mx + b
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) * (x[i] - xMean);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Predict next value (x = n)
  const prediction = slope * n + intercept;

  // Calculate R-squared for confidence
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const actual = y[i];
    const predicted = slope * x[i] + intercept;
    ssRes += (actual - predicted) ** 2;
    ssTot += (actual - yMean) ** 2;
  }

  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
  const confidence = Math.max(0, Math.min(1, rSquared)); // 0-1

  return {
    prediction: Math.max(0, prediction),
    confidence: confidence,
    method: 'linear_regression',
    slope: slope,
    rSquared: rSquared
  };
}

// Get expense prediction for next month
router.get('/expense/:userId', (req, res) => {
  const { userId } = req.params;

  // Get last 12 months of expenses
  const query = `
    SELECT 
      CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, '0')) as month_year,
      SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as monthly_expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY YEAR(date) DESC, MONTH(date) DESC
    LIMIT 12
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.json({
        prediction: 0,
        confidence: 0,
        message: 'Not enough data to predict'
      });
    }

    // Reverse to get chronological order (oldest first)
    const expenses = results.reverse().map(r => parseFloat(r.monthly_expense));

    const prediction = predictNextMonth(expenses);

    res.json({
      ...prediction,
      historical_months: results.length,
      average_expense: expenses.reduce((a, b) => a + b) / expenses.length,
      latest_expense: expenses[expenses.length - 1],
      trend: prediction.slope > 0 ? 'increasing' : 'decreasing'
    });
  });
});

// Get income prediction for next month
router.get('/income/:userId', (req, res) => {
  const { userId } = req.params;

  // Get last 12 months of income
  const query = `
    SELECT 
      CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, '0')) as month_year,
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as monthly_income
    FROM transactions
    WHERE user_id = ?
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY YEAR(date) DESC, MONTH(date) DESC
    LIMIT 12
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.json({
        prediction: 0,
        confidence: 0,
        message: 'Not enough data to predict'
      });
    }

    // Reverse to get chronological order
    const incomes = results.reverse().map(r => parseFloat(r.monthly_income));

    const prediction = predictNextMonth(incomes);

    res.json({
      ...prediction,
      historical_months: results.length,
      average_income: incomes.reduce((a, b) => a + b) / incomes.length,
      latest_income: incomes[incomes.length - 1],
      trend: prediction.slope > 0 ? 'increasing' : 'decreasing'
    });
  });
});

// Get comprehensive prediction (both income and expense)
router.get('/next-month/:userId', (req, res) => {
  const { userId } = req.params;

  // Get expense prediction
  const expenseQuery = `
    SELECT 
      CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, '0')) as month_year,
      SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as monthly_expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY YEAR(date) DESC, MONTH(date) DESC
    LIMIT 12
  `;

  db.query(expenseQuery, [userId], (err, expenseResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get income prediction
    const incomeQuery = `
      SELECT 
        CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, '0')) as month_year,
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as monthly_income
      FROM transactions
      WHERE user_id = ?
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date) DESC, MONTH(date) DESC
      LIMIT 12
    `;

    db.query(incomeQuery, [userId], (err, incomeResults) => {
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

        // Process data
        const expenseData = expenseResults.reverse().map(r => parseFloat(r.monthly_expense));
        const incomeData = incomeResults.reverse().map(r => parseFloat(r.monthly_income));

        // Get predictions
        const expensePrediction = predictNextMonth(expenseData);
        const incomePrediction = predictNextMonth(incomeData);

        // Calculate predicted savings
        const predictedSavings = incomePrediction.prediction - expensePrediction.prediction;
        const budgetStatus = expensePrediction.prediction > monthlyBudget ? 'over' : 'within';

        res.json({
          next_month: {
            predicted_income: Math.round(incomePrediction.prediction),
            income_confidence: (incomePrediction.confidence * 100).toFixed(1) + '%',
            income_trend: incomePrediction.trend,
            
            predicted_expense: Math.round(expensePrediction.prediction),
            expense_confidence: (expensePrediction.confidence * 100).toFixed(1) + '%',
            expense_trend: expensePrediction.trend,
            
            predicted_savings: Math.round(predictedSavings),
            budget_status: budgetStatus,
            budget_vs_prediction: monthlyBudget - expensePrediction.prediction
          },
          historical: {
            avg_income: Math.round(incomeData.reduce((a, b) => a + b) / incomeData.length),
            avg_expense: Math.round(expenseData.reduce((a, b) => a + b) / expenseData.length),
            months_analyzed: Math.max(expenseData.length, incomeData.length)
          },
          accuracy: {
            expense_r_squared: expensePrediction.rSquared,
            income_r_squared: incomePrediction.rSquared,
            recommendation: expensePrediction.rSquared > 0.7 ? 'High confidence prediction' : 'Low confidence - more data needed'
          }
        });
      });
    });
  });
});

module.exports = router;