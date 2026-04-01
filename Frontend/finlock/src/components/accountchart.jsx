import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { useTheme } from "../context/ThemeContext";

const DATE_RANGES = {
  "7D": { label: "7 Days", days: 7 },
  "1M": { label: "1 Month", days: 30 },
  "3M": { label: "3 Months", days: 90 },
  "6M": { label: "6 Months", days: 180 },
  ALL: { label: "All", days: null },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#32353B] border border-[#3C4A42]/20 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-[#8B949E] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className={`text-sm font-semibold text-tabular ${p.dataKey === 'income' ? 'text-[#4EDEA3]' : 'text-[#FFB3AF]'}`}>
            {p.dataKey === 'income' ? 'Income' : 'Expense'}: ₹{p.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AccountBarChart({ transactions }) {
  const { isDark, t } = useTheme();
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (tx) => new Date(tx.date) >= startDate && new Date(tx.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, tx) => {
      const date = format(parseISO(tx.date), "MMM dd");
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (tx.type === "INCOME") acc[date].income += tx.amount;
      else acc[date].expense += tx.amount;
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const net = totals.income - totals.expense;

  return (
    <div className={`${t.card} border rounded-xl p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-base font-semibold ${t.text.primary}`}>Transaction Overview</h2>
        <div className="flex gap-1">
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                ${dateRange === key
                  ? 'bg-[#10B981]/15 text-[#4EDEA3]'
                  : `${t.text.muted} ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'} hover:text-[#E1E2EA]`
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className={`text-label-upper ${t.text.muted} mb-1`}>Income</p>
          <p className="text-xl font-bold text-tabular text-[#4EDEA3]">₹{totals.income.toFixed(2)}</p>
        </div>
        <div>
          <p className={`text-label-upper ${t.text.muted} mb-1`}>Expenses</p>
          <p className="text-xl font-bold text-tabular text-[#FFB3AF]">₹{totals.expense.toFixed(2)}</p>
        </div>
        <div>
          <p className={`text-label-upper ${t.text.muted} mb-1`}>Net</p>
          <p className={`text-xl font-bold text-tabular ${net >= 0 ? 'text-[#4EDEA3]' : 'text-[#FFB3AF]'}`}>
            ₹{net.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <XAxis
              dataKey="date"
              angle={-30}
              textAnchor="end"
              tick={{ fontSize: 11, fill: isDark ? '#484F58' : '#9CA3AF' }}
              axisLine={{ stroke: isDark ? '#272A30' : '#E5E7EB' }}
              tickLine={false}
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? '#484F58' : '#9CA3AF' }}
              tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(39,42,48,0.5)' : 'rgba(0,0,0,0.05)' }} />
            <Bar dataKey="income" name="Income" fill="#4EDEA3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#FFB3AF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#4EDEA3] rounded-full" />
          <span className={`text-xs ${t.text.secondary}`}>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FFB3AF] rounded-full" />
          <span className={`text-xs ${t.text.secondary}`}>Expense</span>
        </div>
      </div>
    </div>
  );
}
