import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import axios from "../utils/axios";
import { useTheme } from "../context/ThemeContext";

export default function BudgetProgress({ currentExpenses }) {
  const { isDark, t } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState(undefined);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await axios.get("/api/v1/budget", { withCredentials: true });
        if (res.data?.budget) {
          setBudget(res.data.budget);
          setNewBudget(res.data.budget.amount?.toString() || "");
        }
      } catch (err) {
        setMessage({ type: "error", text: "Could not load budget" });
      }
    };
    fetchBudget();
  }, [refreshTrigger]);

  const budgetUsed = currentExpenses || 0;
  const budgetTotal = budget?.amount || 0;
  const budgetPercentage = budgetTotal > 0 ? (budgetUsed / budgetTotal) * 100 : 0;
  const isOverBudget = budgetPercentage >= 100;
  const isWarning = budgetPercentage >= 80 && budgetPercentage < 100;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.post("/api/v1/budget", { amount }, { withCredentials: true });
      if (res.data?.success) {
        setMessage({ type: "success", text: "Budget updated" });
        setIsEditing(false);
        setRefreshTrigger(prev => !prev);
      } else {
        setMessage({ type: "error", text: res.data?.error || "Update failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update budget" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const barColor = isOverBudget
    ? 'bg-[#FFB3AF]'
    : isWarning
      ? 'bg-[#FBBF24]'
      : 'bg-gradient-to-r from-[#10B981] to-[#4EDEA3]';

  return (
    <div className={`${t.card} border rounded-xl p-5 mb-8 animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className={`text-sm font-semibold ${t.text.primary}`}>Monthly Budget</h2>
          <p className={`text-xs ${t.text.muted} mt-0.5`}>Default account</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}
          >
            <Pencil className={`w-3.5 h-3.5 ${t.text.secondary}`} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className={`px-2 py-1 w-24 rounded-lg text-sm ${t.input} border focus:outline-none focus:ring-2`}
              disabled={isLoading}
            />
            <button onClick={handleUpdateBudget} disabled={isLoading} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}>
              <Check className="w-4 h-4 text-[#4EDEA3]" />
            </button>
            <button onClick={handleCancel} disabled={isLoading} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}>
              <X className="w-4 h-4 text-[#FFB3AF]" />
            </button>
          </div>
        )}
      </div>

      {/* Amount display */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className={`text-lg font-bold text-tabular ${t.text.primary}`}>
          ₹{budgetUsed.toFixed(2)}
        </span>
        <span className={`text-sm ${t.text.muted}`}>
          / ₹{budgetTotal.toFixed(2)}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#1D2025]' : 'bg-[#E5E7EB]'}`}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs text-tabular ${isOverBudget ? 'text-[#FFB3AF]' : isWarning ? 'text-[#FBBF24]' : t.text.muted}`}>
          {budgetPercentage.toFixed(1)}% used
        </span>
        {isOverBudget && (
          <span className="text-xs text-[#FFB3AF] font-medium">Over budget</span>
        )}
      </div>

      {message.text && (
        <div className={`mt-2 text-xs ${message.type === "success" ? "text-[#4EDEA3]" : "text-[#FFB3AF]"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
