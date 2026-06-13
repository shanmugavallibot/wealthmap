function AIInsights({ userId, transactions, goals }) {
  const getInsights = () => {
    const insights = [];
 
    // Calculate stats
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
 
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });
 
    const totalIncome = monthlyTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
 
    const totalExpense = monthlyTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
 
    const savings = totalIncome - totalExpense;
 
    // Insight 1: Savings rate
    if (totalIncome > 0) {
      const savingsRate = (savings / totalIncome) * 100;
      if (savingsRate > 30) {
        insights.push({
          type: 'positive',
          icon: '✅',
          title: 'Excellent Savings Rate!',
          message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
        });
      } else if (savingsRate > 10) {
        insights.push({
          type: 'neutral',
          icon: '📊',
          title: 'Moderate Savings',
          message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to increase it to 30%.`
        });
      } else {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Low Savings Rate',
          message: `You're saving less than 10%. Consider reducing expenses.`
        });
      }
    }
 
    // Insight 2: Highest expense category
    const categoryExpenses = {};
    monthlyTransactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + parseFloat(t.amount);
      });
 
    const topCategory = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        type: 'info',
        icon: '📍',
        title: 'Top Spending Category',
        message: `${topCategory[0]} is your highest expense at ₹${topCategory[1].toFixed(2)}.`
      });
    }
 
    // Insight 3: Goal progress
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;
 
    if (totalGoals > 0) {
      insights.push({
        type: 'info',
        icon: '🎯',
        title: 'Goal Progress',
        message: `${completedGoals} of ${totalGoals} goals achieved. ${totalGoals - completedGoals} in progress.`
      });
    }
 
    return insights;
  };
 
  const insights = getInsights();
 
  return (
    <div className="card">
      <h2>✨ AI Financial Insights</h2>
      
      {insights.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Add transactions and goals to get personalized insights!</p>
      ) : (
        <div className="insights-list">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card insight-${insight.type}`}>
              <div className="insight-icon">{insight.icon}</div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
export default AIInsights;