import { parseLocalDate } from './dateFilters';
import { getBudgetStatus } from './dateFilters';

/**
 * Computes smart local insights based on transactions, budgets, and accounts.
 * Returns an array of { id, type, title, description, impactLevel, color, badge }
 */
export function generateCoachInsights(transactions = [], budgets = [], accounts = [], currency = '₹') {
  const insights = [];
  
  if (transactions.length === 0) {
    insights.push({
      id: 'no-data',
      type: 'info',
      title: 'Awaiting Financial Inputs',
      description: 'Your PayTrix Coach is ready! Add some transactions to unlock smart local insights, budget burnout warnings, and streaks.',
      impactLevel: 'low',
      color: 'info',
      badge: 'Coach Ready'
    });
    return insights;
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. LOW SPEND STREAK
  // Count consecutive days going back from yesterday (or today) where total expense is low
  let streakDays = 0;
  const daysToCheck = 30; // Check up to last 30 days
  const LOW_SPEND_THRESHOLD = currency === '₹' ? 150 : 2; // Low spend limit

  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date();
    checkDate.setDate(now.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    const dayTotal = expenses
      .filter(t => t.date === checkDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
      
    if (dayTotal <= LOW_SPEND_THRESHOLD) {
      streakDays++;
    } else {
      // Break streak on the first high-spending day
      break;
    }
  }

  if (streakDays >= 3) {
    insights.push({
      id: 'spend-streak',
      type: 'streak',
      title: `${streakDays}-Day Green Streak! 🏆`,
      description: `Incredible self-control! You have spent less than ${currency}${LOW_SPEND_THRESHOLD} per day for ${streakDays} consecutive days. Your wallet is breathing easy.`,
      impactLevel: 'medium',
      color: 'emerald',
      badge: 'Streak Achieved'
    });
  }

  // 2. SPENDING VELOCITY
  // Compare expenses in the last 7 days vs the 7 days prior
  const last7DaysStart = new Date();
  last7DaysStart.setDate(now.getDate() - 6);
  const last7DaysStartStr = last7DaysStart.toISOString().split('T')[0];

  const prev7DaysStart = new Date();
  prev7DaysStart.setDate(now.getDate() - 13);
  const prev7DaysStartStr = prev7DaysStart.toISOString().split('T')[0];

  const current7DaysSpend = expenses
    .filter(t => t.date >= last7DaysStartStr && t.date <= todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const prev7DaysSpend = expenses
    .filter(t => t.date >= prev7DaysStartStr && t.date < last7DaysStartStr)
    .reduce((sum, t) => sum + t.amount, 0);

  if (prev7DaysSpend > 0) {
    const ratio = current7DaysSpend / prev7DaysSpend;
    if (ratio >= 1.25) {
      const percentage = Math.round((ratio - 1) * 100);
      insights.push({
        id: 'spending-velocity',
        type: 'alert',
        title: 'Spending Velocity Spike! ⚡',
        description: `Your spending in the last 7 days (${currency}${current7DaysSpend.toLocaleString()}) has spiked by ${percentage}% compared to the previous week (${currency}${prev7DaysSpend.toLocaleString()}). Try hitting pause on non-essentials.`,
        impactLevel: 'high',
        color: 'rose',
        badge: 'Velocity Spike'
      });
    } else if (ratio <= 0.8) {
      const savings = Math.round((1 - ratio) * 100);
      insights.push({
        id: 'saving-velocity',
        type: 'achievement',
        title: 'Outstanding Savings Acceleration! 📉',
        description: `Brilliant! Your spending this week is ${savings}% lower than last week. You are accelerating toward your savings goals.`,
        impactLevel: 'medium',
        color: 'emerald',
        badge: 'Savings Spike'
      });
    }
  }

  // 3. BUDGET BURNOUT RISK
  // Flag active budgets that are spent too fast
  budgets.forEach(b => {
    if (b.dismissed || b.period === 'ongoing') return;
    const status = getBudgetStatus(b, transactions);
    
    // Calculate progress ratio
    const spendRatio = status.spent / b.amount;
    
    // Calculate elapsed time ratio in period
    const bStart = b.startDate ? parseLocalDate(b.startDate) : new Date();
    const bEnd = b.endDate ? parseLocalDate(b.endDate) : new Date();
    const totalDuration = bEnd.getTime() - bStart.getTime();
    
    if (totalDuration > 0) {
      const elapsed = now.getTime() - bStart.getTime();
      const elapsedRatio = Math.max(0, Math.min(1, elapsed / totalDuration));
      
      // If spent more than 80% but elapsed time is less than 65%
      if (spendRatio > 0.8 && elapsedRatio < 0.65 && status.spent < b.amount) {
        const remainingDays = Math.ceil((bEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        insights.push({
          id: `burnout-${b.id}`,
          type: 'alert',
          title: `Budget Burnout Danger: ${b.category.toUpperCase()} 🚨`,
          description: `Watch out! You have already exhausted ${Math.round(spendRatio * 100)}% of your ${currency}${b.amount} budget, but there are still ${remainingDays} days left. Pace your spending.`,
          impactLevel: 'high',
          color: 'rose',
          badge: 'Burnout Danger'
        });
      }
    }
  });

  // 4. WEEKEND VS WEEKDAY PATTERNS
  let weekendSpend = 0;
  let weekdaySpend = 0;
  
  expenses.forEach(t => {
    const date = parseLocalDate(t.date);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
    } else {
      weekdaySpend += t.amount;
    }
  });

  const totalExpense = weekendSpend + weekdaySpend;
  if (totalExpense > 0) {
    const weekendRatio = weekendSpend / totalExpense;
    if (weekendRatio > 0.5) {
      const percent = Math.round(weekendRatio * 100);
      insights.push({
        id: 'weekend-heavy',
        type: 'pattern',
        title: 'Weekend Heavy Spender 🏖️',
        description: `You spend ${percent}% of your money on Saturdays and Sundays. Planning low-cost weekend leisure or meal prepping could save you serious cash!`,
        impactLevel: 'medium',
        color: 'amber',
        badge: 'Weekend Habit'
      });
    }
  }

  // 5. CATEGORY SPIKE
  // Calculate historical monthly average spending per category and compare to last 30 days
  const last30DaysStart = new Date();
  last30DaysStart.setDate(now.getDate() - 30);
  const last30DaysStartStr = last30DaysStart.toISOString().split('T')[0];

  const categories = [...new Set(expenses.map(t => t.category))];
  categories.forEach(cat => {
    if (cat === 'income') return;
    
    // Spending in last 30 days
    const last30Spend = expenses
      .filter(t => t.category === cat && t.date >= last30DaysStartStr)
      .reduce((sum, t) => sum + t.amount, 0);

    // Total history duration to get historical monthly avg
    if (expenses.length > 5) {
      const catExpenses = expenses.filter(t => t.category === cat);
      if (catExpenses.length >= 3) {
        // Average spending in general
        const totalCatSpend = catExpenses.reduce((sum, t) => sum + t.amount, 0);
        // Find earliest transaction
        const dates = catExpenses.map(t => parseLocalDate(t.date).getTime());
        const minDate = Math.min(...dates);
        const diffMonths = Math.max(1, (now.getTime() - minDate) / (1000 * 60 * 60 * 24 * 30));
        
        const historicalMonthlyAvg = totalCatSpend / diffMonths;
        
        if (last30Spend > 1.35 * historicalMonthlyAvg && last30Spend > (currency === '₹' ? 500 : 10)) {
          const increase = Math.round(((last30Spend / historicalMonthlyAvg) - 1) * 100);
          insights.push({
            id: `spike-${cat}`,
            type: 'alert',
            title: `Spike in ${cat.charAt(0).toUpperCase() + cat.slice(1)} Spending! 📈`,
            description: `Your spending on ${cat} this month (${currency}${last30Spend.toLocaleString()}) is ${increase}% higher than your historical monthly average. Consider shopping with a strict list!`,
            impactLevel: 'medium',
            color: 'amber',
            badge: 'Category Spike'
          });
        }
      }
    }
  });

  // Fallback default insight if insights list is sparse
  if (insights.length < 2) {
    insights.push({
      id: 'general-coach',
      type: 'info',
      title: 'PayTrix Financial Tip 💡',
      description: 'The Golden Rule of Wealth: Always pay yourself first! Set a Savings Goal today and allocate just 10% of your earnings to watch your net worth grow.',
      impactLevel: 'low',
      color: 'info',
      badge: 'Coach Wisdom'
    });
  }

  return insights;
}
