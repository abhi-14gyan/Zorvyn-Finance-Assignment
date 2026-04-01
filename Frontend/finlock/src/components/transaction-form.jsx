import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Loader2, X } from 'lucide-react';
import axios from "../utils/axios";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReceiptScanner } from './receiptScanner';
import { useTheme } from '../context/ThemeContext';

// Custom Button Component
const Button = ({ children, variant = 'primary', className = '', disabled = false, onClick, type = 'button', ...props }) => {
    const baseClasses = 'px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm';
    const { isDark } = useTheme();

    const variants = {
        primary: 'bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold focus:ring-[#4EDEA3]/50 shadow-sm',
        outline: isDark
            ? 'border border-[#3C4A42]/40 bg-[#191C21] hover:bg-[#272A30] text-[#8B949E] hover:text-[#E1E2EA] focus:ring-[#4EDEA3]/30'
            : 'border border-[#D1D5DB] bg-white hover:bg-[#F5F5F4] text-[#6B7280] hover:text-[#111827] focus:ring-[#10B981]/30',
        ghost: isDark
            ? 'text-[#8B949E] hover:bg-[#272A30] hover:text-[#E1E2EA] focus:ring-[#4EDEA3]/30'
            : 'text-[#6B7280] hover:bg-[#F5F5F4] hover:text-[#111827] focus:ring-[#10B981]/30',
    };

    return (
        <button type={type} className={`${baseClasses} ${variants[variant]} ${className}`} disabled={disabled} onClick={onClick} {...props}>
            {children}
        </button>
    );
};

// Custom Input Component
const Input = ({ className = '', error = false, ...props }) => {
    const { t } = useTheme();
    return (
        <input
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${t.input} ${error ? 'border-[#FFB3AF]' : ''} ${className}`}
            {...props}
        />
    );
};

// Custom Select Component
const Select = ({ children, value, onChange, placeholder, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const [selectedLabel, setSelectedLabel] = useState(placeholder || 'Select...');
    const { isDark, t } = useTheme();

    useEffect(() => {
        setSelectedValue(value || '');
        if (value) {
            const child = React.Children.toArray(children).find(child =>
                React.isValidElement(child) && child.props.value === value
            );
            if (child) setSelectedLabel(child.props.children);
        } else {
            setSelectedLabel(placeholder || 'Select...');
        }
    }, [value, children, placeholder]);

    const handleSelect = (optionValue, optionLabel) => {
        setSelectedValue(optionValue);
        setSelectedLabel(optionLabel);
        setIsOpen(false);
        if (onChange) onChange(optionValue);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                className={`w-full px-3 py-2.5 text-left border rounded-lg text-sm focus:outline-none focus:ring-2 flex items-center justify-between transition-all duration-200 ${t.input}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedValue ? t.text.primary : t.text.muted}>
                    {selectedValue ? selectedLabel : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 ${t.text.muted} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto ${isDark ? 'bg-[#272A30] border-[#3C4A42]/40' : 'bg-white border-[#E5E7EB]'}`}>
                    {React.Children.map(children, (child, index) => {
                        if (React.isValidElement(child) && child.type === SelectItem) {
                            return React.cloneElement(child, {
                                key: child.props.value || `select-item-${index}`,
                                onSelect: handleSelect,
                                isSelected: selectedValue === child.props.value,
                            });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
};

const SelectItem = ({ value, children, onSelect, isSelected }) => {
    const { isDark, t } = useTheme();
    return (
        <button
            type="button"
            className={`w-full px-3 py-2 text-left text-sm transition-colors
                ${isDark ? 'hover:bg-[#32353B]' : 'hover:bg-[#F5F5F4]'}
                ${isSelected
                    ? (isDark ? 'bg-[#10B981]/15 text-[#4EDEA3]' : 'bg-[#10B981]/10 text-[#10B981]')
                    : t.text.primary
                }`}
            onClick={() => onSelect(value, children)}
        >
            {children}
        </button>
    );
};

// Custom Switch Component
const Switch = ({ checked, onChange }) => {
    return (
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4EDEA3]/50
                ${checked ? 'bg-[#10B981]' : 'bg-[#32353B]'}`}
            onClick={() => onChange(!checked)}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

// Custom Calendar Component
const SimpleCalendar = ({ selectedDate, onDateSelect, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { isDark, t } = useTheme();

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
        return days;
    };

    const isToday = (date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date) => selectedDate && date.toDateString() === selectedDate.toDateString();
    const days = getDaysInMonth(currentMonth);
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className={`absolute z-20 mt-1 p-4 border rounded-xl shadow-lg ${isDark ? 'bg-[#272A30] border-[#3C4A42]/40' : 'bg-white border-[#E5E7EB]'}`}>
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#32353B]' : 'hover:bg-[#F5F5F4]'} ${t.text.primary}`}>←</button>
                <h3 className={`font-semibold text-sm ${t.text.primary}`}>{monthYear}</h3>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#32353B]' : 'hover:bg-[#F5F5F4]'} ${t.text.primary}`}>→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className={`p-2 text-xs font-medium text-center ${t.text.muted}`}>{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <div key={`day-${index}`} className="p-0.5">
                        {date && (
                            <button
                                type="button"
                                onClick={() => { onDateSelect(date); onClose(); }}
                                className={`w-8 h-8 text-xs rounded-lg transition-colors
                                    ${isDark ? 'hover:bg-[#32353B]' : 'hover:bg-[#F5F5F4]'}
                                    ${isSelected(date) ? 'bg-[#10B981] text-white' : isToday(date) ? 'bg-[#10B981]/15 text-[#4EDEA3]' : t.text.primary}`}
                            >
                                {date.getDate()}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Transaction Form Component
export default function AddTransactionForm({
    accounts = [],
    categories = [],
    editMode = false,
    initialData = null,
    onSubmit: onFormSubmit = () => { },
}) {
    const { t } = useTheme();
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        amount: '',
        description: '',
        accountId: accounts.find(ac => ac.isDefault)?._id || accounts[0]?._id || '',
        category: '',
        date: new Date(),
        isRecurring: false,
        recurringInterval: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const origin = location.state?.from || '/dashboard';

    useEffect(() => {
        if (editMode && initialData) {
            setFormData({
                type: initialData.type,
                amount: initialData.amount.toString(),
                description: initialData.description,
                accountId: initialData.accountId,
                category: initialData.category,
                date: new Date(initialData.date),
                isRecurring: initialData.isRecurring,
                recurringInterval: initialData.recurringInterval || ''
            });
        }
    }, [editMode, initialData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.type) newErrors.type = 'Type is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
        if (!formData.accountId) newErrors.accountId = 'Account is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (formData.isRecurring && !formData.recurringInterval) newErrors.recurringInterval = 'Recurring interval is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setApiError('');
        try {
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
                date: formData.date.toISOString(),
                recurringInterval: formData.isRecurring ? formData.recurringInterval : null
            };
            if (editMode && initialData?._id) {
                await axios.put(`/api/v1/transaction/${initialData._id}`, submitData);
                toast.success("Transaction updated");
            } else {
                await axios.post('/api/v1/transaction', submitData);
                toast.success("Transaction created");
            }
            navigate(origin);
            if (onFormSubmit) await onFormSubmit(submitData);
            if (!editMode) {
                setFormData({
                    type: 'EXPENSE', amount: '', description: '',
                    accountId: accounts.find(ac => ac.isDefault)?._id || accounts[0]?._id || '',
                    category: '', date: new Date(), isRecurring: false, recurringInterval: ''
                });
            }
        } catch (error) {
            if (error.response) setApiError(error.response.data?.message || 'Server error occurred');
            else if (error.request) setApiError('Network error. Please check your connection.');
            else setApiError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        if (apiError) setApiError('');
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const filteredCategories = categories.filter(category => category.type === formData.type);

    const handleScanComplete = (scannedData) => {
        if (!scannedData) return;
        setFormData(prev => ({
            ...prev,
            amount: scannedData.amount ? scannedData.amount.toString() : prev.amount,
            date: scannedData.date ? new Date(scannedData.date) : prev.date,
            description: scannedData.description || prev.description,
            category: scannedData.category || prev.category
        }));
        toast.success("Receipt scanned successfully");
    };

    return (
        <div className={`${t.card} border rounded-xl p-6 sm:p-8`}>
            <div className="space-y-5">
                {/* API Error */}
                {apiError && (
                    <div className="bg-[#FFB3AF]/10 border border-[#FFB3AF]/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-[#FFB3AF]" />
                            <p className="text-sm text-[#FFB3AF]">{apiError}</p>
                        </div>
                        <button onClick={() => setApiError('')} className="text-[#FFB3AF] hover:text-[#FFB3AF]/80">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

                {/* Type */}
                <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${t.text.primary}`}>Type</label>
                    <Select
                        value={formData.type}
                        onChange={(value) => { handleInputChange('type', value); handleInputChange('category', ''); }}
                        placeholder="Select type"
                    >
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </Select>
                    {errors.type && <p className="text-xs text-[#FFB3AF]">{errors.type}</p>}
                </div>

                {/* Amount and Account */}
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${t.text.primary}`}>Amount</label>
                        <Input
                            type="number" step="0.01" placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            error={!!errors.amount}
                        />
                        {errors.amount && <p className="text-xs text-[#FFB3AF]">{errors.amount}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${t.text.primary}`}>Account</label>
                        <Select value={formData.accountId} onChange={(value) => handleInputChange('accountId', value)} placeholder="Select account">
                            {accounts.map((account) => (
                                <SelectItem key={account._id} value={account._id}>
                                    {`${account.name} (₹${parseFloat(account.balance || 0).toFixed(2)})`}
                                </SelectItem>
                            ))}
                        </Select>
                        {errors.accountId && <p className="text-xs text-[#FFB3AF]">{errors.accountId}</p>}
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${t.text.primary}`}>Category</label>
                    <Select value={formData.category} onChange={(value) => handleInputChange('category', value)} placeholder="Select category">
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </Select>
                    {errors.category && <p className="text-xs text-[#FFB3AF]">{errors.category}</p>}
                </div>

                {/* Date */}
                <div className="space-y-1.5 relative">
                    <label className={`text-sm font-medium ${t.text.primary}`}>Date</label>
                    <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`w-full px-3 py-2.5 text-left border rounded-lg text-sm focus:outline-none focus:ring-2 flex items-center justify-between transition-all duration-200 ${t.input}`}
                    >
                        <span className={formData.date ? t.text.primary : t.text.muted}>
                            {formData.date ? formatDate(formData.date) : 'Pick a date'}
                        </span>
                        <Calendar className={`h-4 w-4 ${t.text.muted}`} />
                    </button>
                    {showCalendar && (
                        <SimpleCalendar
                            selectedDate={formData.date}
                            onDateSelect={(date) => handleInputChange('date', date)}
                            onClose={() => setShowCalendar(false)}
                        />
                    )}
                    {errors.date && <p className="text-xs text-[#FFB3AF]">{errors.date}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${t.text.primary}`}>Description</label>
                    <Input
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>

                {/* Recurring Toggle */}
                <div className={`flex flex-row items-center justify-between rounded-xl border p-4 ${t.card} ${t.border}`}>
                    <div>
                        <label className={`text-sm font-medium ${t.text.primary}`}>Recurring Transaction</label>
                        <p className={`text-xs ${t.text.secondary} mt-0.5`}>Set up a recurring schedule</p>
                    </div>
                    <Switch checked={formData.isRecurring} onChange={(checked) => handleInputChange('isRecurring', checked)} />
                </div>

                {formData.isRecurring && (
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${t.text.primary}`}>Recurring Interval</label>
                        <Select value={formData.recurringInterval} onChange={(value) => handleInputChange('recurringInterval', value)} placeholder="Select interval">
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </Select>
                        {errors.recurringInterval && <p className="text-xs text-[#FFB3AF]">{errors.recurringInterval}</p>}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="w-full" onClick={() => navigate(origin)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />{editMode ? "Updating..." : "Creating..."}</>
                        ) : editMode ? "Update Transaction" : "Create Transaction"}
                    </Button>
                </div>
            </div>
        </div>
    );
}