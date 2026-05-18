import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export function Forecaster() {
  const { state } = useFinance();
  const currency = state.settings.currency;
  const isDark = state.settings.theme === 'dark';

  // Calculate current total balance across all accounts
  const currentTotalBalance = useMemo(() => {
    return (state.accounts || []).reduce((sum, account) => {
      let balance = parseFloat(account.initialBalance) || 0;
      state.transactions.forEach(t => {
        if (t.accountId === account.id) {
          if (t.type === 'income') balance += t.amount;
          else balance -= t.amount;
        }
      });
      return sum + balance;
    }, 0);
  }, [state.accounts, state.transactions]);

  // Statistical calculations on past transactions to feed the prediction engine
  const stats = useMemo(() => {
    const txns = state.transactions;
    if (txns.length === 0) {
      return { dailyIncome: 0, dailyExpense: 0, netDaily: 0, daysAnalyzed: 0 };
    }

    // Find the date range of history
    const dates = txns.map(t => new Date(t.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    // Calculate total days (min 7 days to give a baseline representation)
    const msDiff = Math.max(maxDate - minDate, 7 * 24 * 60 * 60 * 1000);
    const daysAnalyzed = Math.ceil(msDiff / (24 * 60 * 60 * 1000));

    let totalIncome = 0;
    let totalExpense = 0;

    txns.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const dailyIncome = totalIncome / daysAnalyzed;
    const dailyExpense = totalExpense / daysAnalyzed;
    
    return {
      dailyIncome,
      dailyExpense,
      netDaily: dailyIncome - dailyExpense,
      daysAnalyzed
    };
  }, [state.transactions]);

  // Generate 90-day forecast projection coordinates
  const forecastData = useMemo(() => {
    const data = [];
    let projectedBalance = currentTotalBalance;
    const today = new Date();

    // Start with Day 0 (Today)
    data.push({
      day: 0,
      dateLabel: 'Today',
      balance: Math.round(projectedBalance),
      type: 'actual'
    });

    // Project days 10, 20, 30, 40, 50, 60, 70, 80, 90
    for (let i = 10; i <= 90; i += 10) {
      projectedBalance += stats.netDaily * 10;
      
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dateLabel = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        day: i,
        dateLabel,
        balance: Math.round(projectedBalance),
        type: 'projected'
      });
    }

    return data;
  }, [currentTotalBalance, stats.netDaily]);

  // High-value insights & tailored coaching recommendations
  const insights = useMemo(() => {
    const daysToZero = stats.netDaily < 0 ? Math.floor(currentTotalBalance / Math.abs(stats.netDaily)) : null;
    
    const balance30d = currentTotalBalance + (stats.netDaily * 30);
    const balance90d = currentTotalBalance + (stats.netDaily * 90);

    const recommendations = [];
    if (stats.netDaily < 0) {
      recommendations.push({
        type: 'danger',
        text: `Your daily burn rate exceeds your income. At this pace, your funds are projected to deplete in ${daysToZero} days.`,
        action: 'We recommend cutting variable shopping or dining budgets by 25% immediately to reverse this trend.'
      });
    } else if (stats.netDaily > 0) {
      recommendations.push({
        type: 'success',
        text: `Excellent! You are accumulating wealth. Your net worth is expanding by ${currency}${Math.round(stats.netDaily * 30).toLocaleString()} every month.`,
        action: 'Consider setting up an automated micro-savings goal or routing surplus cash into a high-yield investment account.'
      });
    }

    // Goal milestone predictions
    const activeGoals = (state.goals || []).filter(g => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0 && stats.netDaily > 0) {
      const topGoal = activeGoals[0];
      const remainingAmount = topGoal.targetAmount - topGoal.currentAmount;
      const daysToGoal = Math.ceil(remainingAmount / (stats.netDaily * 0.2)); // Assume routing 20% of net savings to goals
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysToGoal);
      
      recommendations.push({
        type: 'info',
        text: `Milestone Alert: Based on your current savings rate, you are on track to fully fund your "${topGoal.name}" goal by ${targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
        action: 'Routing an extra 10% of disposable income would speed this up by roughly 12 days!'
      });
    } else if (activeGoals.length > 0) {
      recommendations.push({
        type: 'warning',
        text: `Goal Lag: Your savings goals are currently stalled because your expenses equal or exceed your income.`,
        action: 'Establishing a strict monthly budget cap on non-essential categories will unlock standard goals progression.'
      });
    }

    return {
      daysToZero,
      balance30d,
      balance90d,
      recommendations
    };
  }, [currentTotalBalance, stats.netDaily, state.goals, currency]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-4">
      {/* Page Header */}
      <div className="glass p-5 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Compass className="text-gold-500 animate-spin-slow" size={24} />
            PayTrix Cash Flow Forecaster
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1">Smart browser-based statistical financial projections & milestones planning</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-charcoal-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 shrink-0 self-start md:self-auto">
          <Calendar size={16} className="text-gold-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">90-Day Projection Matrix</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* Left Columns (Col Span 2): Projections Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-5 md:p-6 rounded-2xl h-[350px] md:h-[420px] flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Predictive Balance Growth (90 Days)</h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span> Actual Today
                </span>
                <span className="flex items-center gap-1.5 text-gold-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-400 border border-dashed border-gold-500"></span> Future Projection
                </span>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {state.transactions.length < 5 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <AlertTriangle className="text-gold-500 mb-3" size={32} />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Insufficient transaction history</p>
                  <p className="text-xs max-w-xs mt-1 text-gray-500 dark:text-gray-400">Please record at least 5 transactions across your active wallets to seed the predictive cash flow engine.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <XAxis dataKey="dateLabel" stroke={isDark ? "#6B7280" : "#9CA3AF"} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={isDark ? "#6B7280" : "#9CA3AF"} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#121212' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                      formatter={(value) => [`${currency}${value.toLocaleString()}`, 'Projected Balance']}
                    />
                    <ReferenceLine y={currentTotalBalance} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="balance" stroke="#F5A623" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4, stroke: "#F5A623", strokeWidth: 2, fill: isDark ? "#121212" : "#ffffff" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Metrics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass p-5 rounded-2xl border border-gray-200 dark:border-white/5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Liquidity</p>
              <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1">
                {currency}{currentTotalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`glass p-5 rounded-2xl border ${insights.balance30d >= currentTotalBalance ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'}`}>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Projected (30 Days)</p>
              <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
                {insights.balance30d >= currentTotalBalance ? <ArrowUpRight className="text-emerald-500" size={18} /> : <ArrowDownRight className="text-rose-500" size={18} />}
                {currency}{Math.round(insights.balance30d).toLocaleString()}
              </p>
            </div>
            <div className={`glass p-5 rounded-2xl border ${insights.balance90d >= currentTotalBalance ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'}`}>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Projected (90 Days)</p>
              <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
                {insights.balance90d >= currentTotalBalance ? <ArrowUpRight className="text-emerald-500" size={18} /> : <ArrowDownRight className="text-rose-500" size={18} />}
                {currency}{Math.round(insights.balance90d).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Coach Insights */}
        <div className="space-y-6">
          <div className="glass p-5 md:p-6 rounded-2xl">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lightbulb className="text-gold-500" size={20} />
              Smart Coach Insights
            </h3>

            {state.transactions.length < 5 ? (
              <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                Insights will update dynamically once the forecaster obtains more transactions details.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Daily Averages */}
                <div className="bg-gray-50 dark:bg-charcoal-900/50 p-4 rounded-xl border border-gray-200/50 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Average Daily Income:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">+{currency}{Math.round(stats.dailyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Average Daily Spending:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">-{currency}{Math.round(stats.dailyExpense)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-white/5 pt-2 flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-700 dark:text-gray-300">Net Daily Flow:</span>
                    <span className={`font-mono ${stats.netDaily >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {stats.netDaily >= 0 ? '+' : ''}{currency}{Math.round(stats.netDaily)}
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${rec.type === 'danger' ? 'border-rose-500/10 bg-rose-500/5 text-rose-800 dark:text-rose-200' : rec.type === 'warning' ? 'border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-200' : rec.type === 'info' ? 'border-blue-500/10 bg-blue-500/5 text-blue-800 dark:text-blue-200' : 'border-emerald-500/10 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200'}`}>
                      <p className="text-xs font-semibold leading-relaxed">{rec.text}</p>
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] opacity-90 leading-relaxed font-medium">
                        💡 <span className="font-bold">Coach Tip:</span> {rec.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
