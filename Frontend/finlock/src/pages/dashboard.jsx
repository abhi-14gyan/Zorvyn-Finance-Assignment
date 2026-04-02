import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, parseISO } from "date-fns";
import { Plus, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CreateAccountDrawer } from '../components/CreateAccountDrawer';
import BudgetProgress from '../components/BudgetProgress';
import AccountDropdown from '../components/accountCardDropdown';
import AppLayout from '../components/AppLayout';
import { chartColors } from '../theme';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, checkingAuth } = useAuth();
  const { isDark, t } = useTheme();
  const isAdmin = user?.role === 'admin';
  const [openDrawer, setOpenDrawer] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!checkingAuth && !user) navigate("/signin");
  }, [user, checkingAuth, navigate]);

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/dashboard/accounts', { withCredentials: true });
      if (response.status === 200) {
        setAccounts(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts.find((a) => a.isDefault)?._id || accounts[0]._id);
    }
  }, [accounts, selectedAccount]);

  // Fetch budget
  useEffect(() => {
    const fetchBudget = async () => {
      const defaultAccount = accounts?.find((account) => account.isDefault);
      if (!defaultAccount) return;
      try {
        const res = await axios.get('/api/v1/budget', { withCredentials: true });
        setBudgetData(res.data);
      } catch (err) { /* silent */ }
    };
    fetchBudget();
  }, [accounts]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/v1/dashboard/transactions', {}, { withCredentials: true });
        setTransactions(response.data.data);
      } catch (error) { /* silent */ }
    };
    fetchTransactions();
  }, []);

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    fetchAccounts();
  };

  const handleAccountClick = (accountId) => navigate(`/account/${accountId}`);

  const changeDefaultAccount = async (account) => {
    if (account.isDefault) {
      toast.error("At least one default account is required");
      return;
    }
    try {
      await axios.put(`/api/v1/account/default/${account._id}`, {}, { withCredentials: true });
      toast.success("Default account updated");
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update default account");
    }
  };

  const handleAccountDeleted = () => {
    fetchAccounts();
    toast.success("Account deleted successfully");
  };

  if (checkingAuth) {
    return (
      <div className={`min-h-screen ${t.background} flex items-center justify-center`}>
        <div className="animate-shimmer w-16 h-16 rounded-xl" />
      </div>
    );
  }

  // ── Computed data ──
  const accountTransactions = transactions.filter((tx) => tx.accountId === selectedAccount);
  const recentTransactions = [...accountTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((tx) => {
    const d = new Date(tx.date);
    return tx.type === "EXPENSE" && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Overview stats
  const totalBalance = accounts.reduce((sum, acct) => sum + parseFloat(acct.balance || 0), 0);
  const monthlyIncome = accountTransactions
    .filter(tx => {
      const d = new Date(tx.date);
      return tx.type === "INCOME" && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyExpenses = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const capitalizeFirst = (str) => str?.charAt(0).toUpperCase() + str?.slice(1) || '';

  // Custom tooltip for donut chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${t.card} border rounded-lg px-3 py-2 shadow-lg`}>
          <p className={`text-sm font-medium ${t.text.primary}`}>{capitalizeFirst(payload[0].name)}</p>
          <p className="text-sm text-tabular font-semibold text-[#4EDEA3]">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className={`text-3xl font-bold ${t.text.primary} tracking-tight`}>
          Dashboard
        </h1>
        <p className={`${t.text.secondary} text-sm mt-1`}>
          Welcome back{user?.username ? `, ${user.username}` : ''}
        </p>
      </div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total Balance',
            value: totalBalance,
            icon: Wallet,
            color: 'text-[#4EDEA3]',
            bg: 'bg-[#4EDEA3]/10',
          },
          {
            label: 'Monthly Income',
            value: monthlyIncome,
            icon: TrendingUp,
            color: 'text-[#4EDEA3]',
            bg: 'bg-[#4EDEA3]/10',
          },
          {
            label: 'Monthly Expenses',
            value: monthlyExpenses,
            icon: TrendingDown,
            color: 'text-[#FFB3AF]',
            bg: 'bg-[#FFB3AF]/10',
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`${t.card} border rounded-xl p-5 animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-label-upper ${t.text.secondary}`}>{stat.label}</span>
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${t.text.primary} text-tabular tracking-tight`}>
              ₹{stat.value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Budget Progress ── */}
      <BudgetProgress currentExpenses={budgetData?.currentExpenses} />

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Transactions */}
        <div className={`${t.card} border rounded-xl p-6 animate-fade-in-up`} style={{ animationDelay: '0.15s' }}>
          <div className="flex justify-between items-center mb-5">
            <h2 className={`text-base font-semibold ${t.text.primary}`}>Recent Transactions</h2>
            <select
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={`${t.input} rounded-lg px-3 py-1.5 text-sm border focus:outline-none focus:ring-2 cursor-pointer`}
            >
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.userId?.username ? `${account.userId.username} — ${account.name}` : account.name}
                </option>
              ))}
            </select>
          </div>

          {recentTransactions.length === 0 ? (
            <div className={`text-center py-8 ${t.text.muted}`}>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((tx, i) => (
                <div
                  key={tx._id || i}
                  className={`flex justify-between items-center py-3 px-3 rounded-lg transition-colors duration-150 ${i % 2 === 0 ? '' : isDark ? 'bg-[#0B0E13]/40' : 'bg-[#F5F5F4]/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-[#4EDEA3]/10' : 'bg-[#FFB3AF]/10'}`}>
                      {tx.type === 'INCOME'
                        ? <ArrowUp className="w-4 h-4 text-[#4EDEA3]" />
                        : <ArrowDown className="w-4 h-4 text-[#FFB3AF]" />
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${t.text.primary}`}>{tx.description || tx.title || capitalizeFirst(tx.category)}</p>
                      <p className={`text-xs ${t.text.muted}`}>
                        {format(parseISO(tx.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold text-tabular ${tx.type === 'INCOME' ? 'text-[#4EDEA3]' : 'text-[#FFB3AF]'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Expense Breakdown (Donut Chart) */}
        <div className={`${t.card} border rounded-xl p-6 animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
          <h2 className={`text-base font-semibold ${t.text.primary} mb-5`}>Monthly Expenses</h2>

          {pieChartData.length === 0 ? (
            <div className={`text-center py-12 ${t.text.muted}`}>
              <p className="text-sm">No expenses this month</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
                {pieChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className={`text-xs ${t.text.secondary} truncate`}>
                      {capitalizeFirst(item.name)}
                    </span>
                    <span className={`text-xs ${t.text.primary} text-tabular font-medium ml-auto`}>
                      ₹{item.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Account Cards ── */}
      <div className="mb-4">
        <h2 className={`text-base font-semibold ${t.text.primary} mb-4`}>Accounts</h2>
      </div>

      <CreateAccountDrawer open={openDrawer} setOpen={setOpenDrawer} onClose={handleDrawerClose} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {/* Add Account Card — Admin Only */}
        {isAdmin && (
          <div
            onClick={() => setOpenDrawer(true)}
            className={`${t.card} border border-dashed rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all duration-200 ${t.cardHover} group`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${isDark ? 'bg-[#272A30] group-hover:bg-[#4EDEA3]/15' : 'bg-[#F5F5F4] group-hover:bg-[#10B981]/15'}`}>
              <Plus className={`w-6 h-6 ${t.text.secondary} group-hover:text-[#4EDEA3] transition-colors`} />
            </div>
            <span className={`text-sm ${t.text.secondary} group-hover:text-[#4EDEA3] transition-colors`}>Add New Account</span>
          </div>
        )}

        {/* Account Cards */}
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={`${t.card} border rounded-xl p-6 min-h-[160px] animate-shimmer`} />
          ))
        ) : (
          accounts.map((account, i) => (
            <div
              key={account._id}
              onClick={() => handleAccountClick(account._id)}
              className={`${t.card} border rounded-xl p-6 min-h-[160px] cursor-pointer transition-all duration-200 ${t.cardHover} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  {account.userId?.username && (
                    <p className={`text-[11px] font-medium uppercase tracking-wider ${t.text.muted} mb-0.5`}>
                      {account.userId.username}
                    </p>
                  )}
                  <h3 className={`font-semibold ${t.text.primary} text-[15px]`}>
                    {capitalizeFirst(account.name)}
                  </h3>
                  <p className={`text-xs ${t.text.muted} mt-0.5`}>
                    {capitalizeFirst(account.type)}
                    {account.isDefault && (
                      <span className="text-[#4EDEA3] ml-1.5">• Default</span>
                    )}
                  </p>
                </div>

                {/* Account management — Admin Only */}
                {isAdmin && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Default toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); changeDefaultAccount(account); }}
                      className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ${account.isDefault ? 'bg-[#10B981]' : isDark ? 'bg-[#32353B]' : 'bg-[#D1D5DB]'}`}
                    >
                      <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-200 ${account.isDefault ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                    </button>

                    <AccountDropdown accountId={account._id} onDeleteSuccess={handleAccountDeleted} />
                  </div>
                )}
              </div>

              <p className={`text-2xl font-bold ${t.text.primary} text-tabular tracking-tight`}>
                ₹{parseFloat(account.balance).toFixed(2)}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-3.5 h-3.5 text-[#4EDEA3]" />
                  <span className={`text-xs ${t.text.secondary}`}>Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5 text-[#FFB3AF]" />
                  <span className={`text-xs ${t.text.secondary}`}>Expense</span>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && accounts.length === 0 && (
          <div className={`${t.card} border rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] col-span-full`}>
            <p className={`${t.text.secondary} text-center text-sm`}>
              No accounts found. Create your first account to get started!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className={`${t.text.muted} text-xs`}>
          Powered by Zorvyn Finance
        </p>
      </div>
    </AppLayout>
  );
};

export default Dashboard;