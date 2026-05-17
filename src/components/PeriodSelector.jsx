import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getPeriodDates } from '../utils/dateFilters';

export function PeriodSelector() {
  const { state, dispatch } = useFinance();
  const { selectedPeriod, customStartDate, customEndDate } = state.settings;
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customStartDate || '');
  const [tempEnd, setTempEnd] = useState(customEndDate || '');

  const periods = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'this-week', label: 'This Week' },
    { id: 'all-time', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const dateInfo = getPeriodDates(selectedPeriod, customStartDate, customEndDate);

  const handlePeriodSelect = (periodId) => {
    if (periodId !== 'custom') {
      dispatch({ type: 'SET_PERIOD', payload: { period: periodId } });
      setIsOpen(false);
    } else {
      dispatch({ type: 'SET_PERIOD', payload: { period: 'custom', startDate: tempStart, endDate: tempEnd } });
    }
  };

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    if (tempStart && tempEnd) {
      dispatch({ type: 'SET_PERIOD', payload: { period: 'custom', startDate: tempStart, endDate: tempEnd } });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative min-w-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-2 rounded-xl bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-charcoal-900 transition-colors text-xs md:text-sm font-medium shadow-sm shrink-0 min-w-0"
      >
        <Calendar size={14} className="text-gold-500 shrink-0" />
        <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">{dateInfo.label}</span>
        <ChevronDown size={12} className="text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-xs bg-white dark:bg-charcoal-850 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Select Period</h4>
            <div className="space-y-1">
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePeriodSelect(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedPeriod === p.id ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {selectedPeriod === 'custom' && (
              <form onSubmit={handleApplyCustomDates} className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={tempStart}
                      onChange={(e) => setTempStart(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white dark:color-scheme-dark"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={tempEnd}
                      onChange={(e) => setTempEnd(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white dark:color-scheme-dark"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-xl text-xs transition-colors"
                >
                  Apply Filter
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
