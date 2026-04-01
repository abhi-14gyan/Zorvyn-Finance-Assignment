import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const AccountDropdown = ({ accountId, onDeleteSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  const { isDark, t } = useTheme();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/v1/dashboard/accounts/${accountId}`);
      setIsOpen(false);
      setConfirmOpen(false);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      toast.error("Error deleting account");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setConfirmOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button onClick={toggleMenu} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'} ${t.text.muted}`}>
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div onClick={(e) => e.stopPropagation()} className={`absolute right-0 mt-8 w-32 rounded-lg shadow-lg z-50 text-sm border ${isDark ? 'bg-[#272A30] border-[#3C4A42]/40' : 'bg-white border-[#E5E7EB]'}`}>
          <button
            onClick={() => setConfirmOpen(true)}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${isDark ? 'hover:bg-[#FFB3AF]/10' : 'hover:bg-[#FFB3AF]/10'} text-[#FFB3AF]`}
          >
            Delete
          </button>
        </div>
      )}

      {confirmOpen && (
        <div onClick={(e) => e.stopPropagation()} className={`absolute right-0 mt-16 w-64 rounded-xl shadow-lg p-4 z-50 border ${isDark ? 'bg-[#272A30] border-[#3C4A42]/40' : 'bg-white border-[#E5E7EB]'}`}>
          <p className={`text-sm mb-3 ${t.text.secondary}`}>Are you sure you want to delete this account?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${isDark ? 'bg-[#32353B] hover:bg-[#36393F] text-[#E1E2EA]' : 'bg-[#F5F5F4] hover:bg-[#E5E7EB] text-[#111827]'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm rounded-lg bg-[#FFB3AF]/20 hover:bg-[#FFB3AF]/30 text-[#FFB3AF] disabled:opacity-50 transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
