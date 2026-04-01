import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const TransactionDropdown = ({ transaction, deleteFn, accountId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { isDark, t } = useTheme();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const handleEdit = () => {
    navigate(`/transaction/?edit=${transaction._id}`, { state: { from: `/account/${accountId}` } });
    setIsOpen(false);
  };
  const handleDelete = () => {
    deleteFn([transaction.id]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
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
        <div className={`absolute right-0 mt-8 w-32 rounded-lg shadow-lg z-50 text-sm border ${isDark ? 'bg-[#272A30] border-[#3C4A42]/40' : 'bg-white border-[#E5E7EB]'}`}>
          <button onClick={handleEdit} className={`w-full px-4 py-2 text-left rounded-t-lg transition-colors ${isDark ? 'hover:bg-[#32353B] text-[#E1E2EA]' : 'hover:bg-[#F5F5F4] text-[#111827]'}`}>
            Edit
          </button>
          <div className={`border-t ${isDark ? 'border-[#3C4A42]/40' : 'border-[#E5E7EB]'}`} />
          <button onClick={handleDelete} className={`w-full px-4 py-2 text-left rounded-b-lg transition-colors ${isDark ? 'hover:bg-[#FFB3AF]/10' : 'hover:bg-[#FFB3AF]/10'} text-[#FFB3AF]`}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDropdown;
