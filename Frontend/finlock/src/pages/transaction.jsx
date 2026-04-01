import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../utils/axios";
import AddTransactionForm from "../components/transaction-form";
import { defaultCategories } from "../data/category";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../components/AppLayout";

const AddTransactionPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const { t } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountRes = await axios.get('/api/v1/dashboard/accounts', {
                    withCredentials: true,
                });
                setAccounts(accountRes.data.data);
                if (editId) {
                    const txnRes = await axios.get(`/api/v1/transaction/${editId}`);
                    setInitialData(txnRes.data.data);
                }
            } catch (err) {
                console.error("Error loading form data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [editId]);

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="animate-shimmer h-10 w-48 rounded-lg" />
                    <div className="animate-shimmer h-96 rounded-xl" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mb-8 animate-fade-in-up">
                <h1 className={`text-2xl sm:text-3xl font-bold ${t.text.primary} tracking-tight`}>
                    {editId ? "Update Transaction" : "Add Transaction"}
                </h1>
                <p className={`text-sm ${t.text.secondary} mt-1`}>
                    {editId ? "Modify your transaction details" : "Record a new income or expense"}
                </p>
            </div>

            <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <AddTransactionForm
                    accounts={accounts}
                    categories={defaultCategories}
                    editMode={!!editId}
                    initialData={initialData}
                />
            </div>
        </AppLayout>
    );
};

export default AddTransactionPage;
