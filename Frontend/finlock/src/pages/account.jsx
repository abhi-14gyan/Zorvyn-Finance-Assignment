import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../utils/axios";
import { format, parseISO } from "date-fns";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, Trash, X } from 'lucide-react';
import { toast } from 'react-toastify';

import { useTheme } from "../context/ThemeContext";
import Dropdown from '../components/Dropdown';
import { AccountBarChart } from '../components/accountchart';
import AppLayout from '../components/AppLayout';
import { categoryColors as catColors } from '../theme';

const AccountPage = () => {
  const { accountId } = useParams();
  const { isDark, t } = useTheme();

  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setselectedType] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [SortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });

  const fetchAccountDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/account/${accountId}`, { withCredentials: true });
      if (response.data?.data) setAccountData(response.data.data);
      else setError('Account not found');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAccountDetails(); }, [accountId]);

  const handleSort = (field) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAll = (isChecked) => {
    setSelectedTransactions(isChecked ? paginatedTransactions.map(t => t._id) : []);
  };

  const handleSelectTransaction = (id) => {
    setSelectedTransactions(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handlebulkdelete = async (transactionIds) => {
    try {
      await axios.delete("/api/v1/account/transactions/bulk-delete", {
        data: { transactionIds },
        withCredentials: true,
      });
      toast.success("Deleted successfully");
      fetchAccountDetails();
      setSelectedTransactions([]);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setselectedType("All Types");
    setSelectedTransactions([]);
  };

  const filteredTransactions = useMemo(() => {
    let result = [...(accountData?.transactions || [])];
    if (selectedCategory !== "All Categories")
      result = result.filter(t => t.category === selectedCategory);
    if (searchTerm.trim() !== "")
      result = result.filter(t => t.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedType === "recurring")
      result = result.filter(t => t.isRecurring);
    else if (selectedType === "non-recurring")
      result = result.filter(t => !t.isRecurring);

    result.sort((a, b) => {
      let comparison = 0;
      switch (SortConfig.field) {
        case "date": comparison = new Date(a.date) - new Date(b.date); break;
        case "amount": comparison = a.amount - b.amount; break;
        case "category": comparison = a.category.localeCompare(b.category); break;
        default: comparison = 0;
      }
      return SortConfig.direction === "asc" ? comparison : -comparison;
    });
    return result;
  }, [accountData?.transactions, selectedCategory, searchTerm, selectedType, SortConfig]);

  const transactionsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  const totals = useMemo(() => {
    let income = 0, expenses = 0;
    filteredTransactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.type === "INCOME") income += amount;
      else if (t.type === "EXPENSE") expenses += amount;
    });
    return { income, expenses, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const deleteFn = (ids) => {
    if (!Array.isArray(ids)) return;
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;
    setAccountData((prevData) => ({
      ...prevData,
      transactions: prevData.transactions.filter((t) => !ids.includes(t.id)),
    }));
    setSelectedTransactions((current) => current.filter((id) => !ids.includes(id)));
  };

  const capitalizeFirst = (str) => str?.charAt(0).toUpperCase() + str?.slice(1) || '';

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="animate-shimmer h-10 w-48 rounded-lg" />
          <div className="animate-shimmer h-64 rounded-xl" />
          <div className="animate-shimmer h-96 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#FFB3AF] text-sm">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider ${t.text.muted} hover:text-[#E1E2EA] transition-colors`}
    >
      {children}
      {SortConfig.field === field && (
        SortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );

  return (
    <AppLayout>
      {/* ── Account Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4 animate-fade-in-up">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${t.text.primary} tracking-tight`}>
            {accountData.name}
          </h1>
          <p className={`text-sm ${t.text.secondary} mt-1`}>{capitalizeFirst(accountData.type)}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl sm:text-3xl font-bold ${t.text.primary} text-tabular tracking-tight`}>
            ₹{accountData.balance.toFixed(2)}
          </p>
          <p className={`text-sm ${t.text.muted} mt-1`}>{totals.count} transactions</p>
        </div>
      </div>

      {/* ── Chart ── */}
      {accountData?.transactions && (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <AccountBarChart transactions={accountData.transactions} />
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div className="space-y-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.text.muted}`} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${t.input} w-full pl-10 py-2.5 rounded-lg border focus:outline-none focus:ring-2 text-sm`}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${t.input} rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 flex-1 text-sm`}>
            <option>All Categories</option>
            <optgroup label="Income">
              <option value="salary">Salary</option>
              <option value="freelance">Freelance</option>
              <option value="investments">Investments</option>
              <option value="other-income">Other Income</option>
            </optgroup>
            <optgroup label="Expenses">
              <option value="housing">Housing</option>
              <option value="transportation">Transportation</option>
              <option value="groceries">Groceries</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="food">Food</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="travel">Travel</option>
            </optgroup>
          </select>

          <select value={selectedType} onChange={(e) => setselectedType(e.target.value)}
            className={`${t.input} rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 flex-1 text-sm`}>
            <option>All Types</option>
            <option value="recurring">Recurring</option>
            <option value="non-recurring">Non-Recurring</option>
          </select>

          {(selectedCategory !== "All Categories" || selectedType !== "All Types" || searchTerm || selectedTransactions.length > 0) && (
            <button onClick={clearFilters}
              className={`px-3 py-2 rounded-lg border ${t.border} ${t.text.secondary} hover:text-[#FFB3AF] transition-colors flex-shrink-0`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {selectedTransactions.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => handlebulkdelete(selectedTransactions)}
              className="rounded-lg px-4 py-2 bg-[#FFB3AF]/10 text-[#FFB3AF] border border-[#FFB3AF]/20 flex items-center gap-2 text-sm font-medium hover:bg-[#FFB3AF]/20 transition-colors"
            >
              <Trash className="h-4 w-4" />
              Delete Selected ({selectedTransactions.length})
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop Table ── */}
      <div className={`hidden md:block ${t.card} border rounded-xl overflow-hidden animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
        <div className={`px-5 py-3 border-b ${t.border}`}>
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-[#3C4A42] bg-transparent accent-[#4EDEA3]"
              />
            </div>
            <div className="col-span-2"><SortButton field="date">Date</SortButton></div>
            <div className={`col-span-3 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Description</div>
            <div className="col-span-2"><SortButton field="category">Category</SortButton></div>
            <div className="col-span-2"><SortButton field="amount">Amount</SortButton></div>
            <div className={`col-span-1 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Type</div>
            <div className="col-span-1" />
          </div>
        </div>

        <div>
          {paginatedTransactions.map((tx, i) => (
            <div
              key={tx._id}
              className={`px-5 py-3 transition-colors duration-150
                ${i % 2 === 0
                  ? ''
                  : isDark ? 'bg-[#0B0E13]/30' : 'bg-[#F5F5F4]/50'
                }
                ${isDark ? 'hover:bg-[#272A30]/50' : 'hover:bg-[#F5F5F4]'}
              `}
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    onChange={() => handleSelectTransaction(tx._id)}
                    checked={selectedTransactions.includes(tx._id)}
                    className="rounded border-[#3C4A42] bg-transparent accent-[#4EDEA3]"
                  />
                </div>
                <div className={`col-span-2 text-sm text-tabular ${t.text.primary}`}>
                  {format(parseISO(tx.date), "dd MMM yyyy")}
                </div>
                <div className={`col-span-3 text-sm font-medium ${t.text.primary} truncate`}>
                  {tx.description}
                </div>
                <div className="col-span-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${catColors[tx.category] || '#8B949E'}15`,
                      color: catColors[tx.category] || '#8B949E',
                    }}
                  >
                    {capitalizeFirst(tx.category)}
                  </span>
                </div>
                <div className={`col-span-2 text-sm font-semibold text-tabular ${tx.type === "EXPENSE" ? 'text-[#FFB3AF]' : 'text-[#4EDEA3]'}`}>
                  {tx.type === "EXPENSE" ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                </div>
                <div className={`col-span-1 flex items-center gap-1 ${t.text.muted}`}>
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{tx.isRecurring ? "Yes" : "No"}</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Dropdown transaction={tx} deleteFn={deleteFn} accountId={accountId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {paginatedTransactions.map((tx) => (
          <div key={tx._id} className={`${t.card} border rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  onChange={() => handleSelectTransaction(tx._id)}
                  checked={selectedTransactions.includes(tx._id)}
                  className="rounded border-[#3C4A42] bg-transparent accent-[#4EDEA3] mt-0.5"
                />
                <div>
                  <p className={`text-sm font-medium ${t.text.primary}`}>{tx.description}</p>
                  <p className={`text-xs ${t.text.muted} mt-0.5`}>
                    {format(parseISO(tx.date), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              </div>
              <Dropdown transaction={tx} deleteFn={deleteFn} accountId={accountId} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${catColors[tx.category] || '#8B949E'}15`,
                    color: catColors[tx.category] || '#8B949E',
                  }}
                >
                  {capitalizeFirst(tx.category)}
                </span>
                <span className={`text-xs ${t.text.muted} flex items-center gap-1`}>
                  <Clock className="w-3 h-3" />
                  {tx.isRecurring ? "Recurring" : "One-time"}
                </span>
              </div>
              <span className={`text-sm font-semibold text-tabular ${tx.type === "EXPENSE" ? 'text-[#FFB3AF]' : 'text-[#4EDEA3]'}`}>
                {tx.type === "EXPENSE" ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={`mt-6 ${t.card} border rounded-xl px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2`}>
          <span className={`text-xs ${t.text.muted}`}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${t.border} border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`px-3 py-1 text-sm text-tabular ${t.text.primary}`}>
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${t.border} border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8">
        <p className={`${t.text.muted} text-xs`}>Powered by Finlock</p>
      </div>
    </AppLayout>
  );
};

export default AccountPage;