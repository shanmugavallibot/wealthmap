import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
 
function ExpenseChart({ transactions }) {
  const [chartData, setChartData] = useState(null);
 
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
 
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return (
        t.transaction_type === 'expense' &&
        date.getMonth() + 1 === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
 
    const categoryTotals = {};
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
    });
 
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
 
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#f97316', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
    ];
 
    setChartData({
      labels: categories,
      datasets: [
        {
          label: 'Expenses by Category',
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: '#1e293b',
          borderWidth: 2,
        }
      ]
    });
  }, [transactions]);
 
  return (
    <div className="card">
      <h2>📊 Expense Distribution</h2>
      {chartData ? (
        <div style={{ maxHeight: '300px' }}>
          <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      ) : (
        <p style={{ color: '#94a3b8' }}>No expense data for this month</p>
      )}
    </div>
  );
}
 
export default ExpenseChart;