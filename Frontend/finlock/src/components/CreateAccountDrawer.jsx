import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "../model/zod.model";
import { useTheme } from "../context/ThemeContext";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

export function CreateAccountDrawer({ open, setOpen, onClose, children }) {
  const [loading, setLoading] = useState(false);
  const { isDark, t } = useTheme();

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", type: "CURRENT", balance: "", isDefault: false },
  });

  const handleClick = async () => {
    const formData = {
      name: watch("name"), type: watch("type"),
      balance: watch("balance"), isDefault: watch("isDefault"),
    };
    try {
      setLoading(true);
      const response = await axios.post("/api/v1/dashboard/accounts", formData, { withCredentials: true });
      if (response.data.success) {
        toast.success("Account created successfully");
        reset();
        onClose();
      } else {
        toast.error(response.data.message || "Account creation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>{children}</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border mx-4
            ${isDark ? 'bg-[#1D2025] border-[#3C4A42]/20' : 'bg-white border-[#E5E7EB]'}`}>

            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-semibold ${t.text.primary}`}>Create New Account</h2>
              <button onClick={() => setOpen(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'} ${t.text.secondary}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className={`block text-sm font-medium ${t.text.primary} mb-1.5`}>Account Name</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-all duration-200 ${t.input}`}
                  placeholder="e.g., Personal account"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-[#FFB3AF] mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium ${t.text.primary} mb-1.5`}>Account Type</label>
                <select
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-all duration-200 ${t.input}`}
                  {...register("type")} defaultValue="CURRENT"
                >
                  <option value="CURRENT">Current</option>
                  <option value="SAVINGS">Savings</option>
                </select>
                {errors.type && <p className="text-xs text-[#FFB3AF] mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium ${t.text.primary} mb-1.5`}>Initial Balance</label>
                <input
                  type="number" step="0.01"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-all duration-200 ${t.input}`}
                  placeholder="0.00" {...register("balance")}
                />
                {errors.balance && <p className="text-xs text-[#FFB3AF] mt-1">{errors.balance.message}</p>}
              </div>

              <div className={`flex items-center justify-between border p-3 rounded-xl ${t.border}`}>
                <div>
                  <label className={`text-sm font-medium ${t.text.primary}`}>Set as Default</label>
                  <p className={`text-xs ${t.text.muted} mt-0.5`}>Used by default for transactions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("isDefault", !watch("isDefault"))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${watch("isDefault") ? 'bg-[#10B981]' : isDark ? 'bg-[#32353B]' : 'bg-[#D1D5DB]'}`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200 ${watch("isDefault") ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors
                    ${isDark ? 'border-[#3C4A42]/40 text-[#8B949E] hover:bg-[#272A30]' : 'border-[#D1D5DB] text-[#6B7280] hover:bg-[#F5F5F4]'}`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold rounded-xl text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
