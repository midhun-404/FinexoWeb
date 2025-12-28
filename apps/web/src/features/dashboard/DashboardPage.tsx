import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { authService } from '../../services/auth';
import { analyticsService, type MonthlySummary } from '../../services/analytics';
import { incomeService } from '../../services/income';
import { expenseService } from '../../services/expense';
import { FelicaInsight } from '../../components/felica/FelicaInsight';
import { HealthScoreCard } from './HealthScoreCard';
import { SmartHighlights } from './SmartHighlights';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Plus, X } from 'lucide-react';
import { useDate } from '../../context/DateContext';
import { Button } from '../../components/ui/Button';
import { ExpenseForm } from '../expenses/ExpenseForm';
import { IncomeForm } from '../income/IncomeForm';

export const DashboardPage = () => {
    const [user, setUser] = useState<any>(null);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedMonth, selectedYear } = useDate();

    // Quick Action States
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<any>(null);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        setUser(authService.getCurrentUser());
        try {
            const [summaryData, incomeData, expenseData] = await Promise.all([
                analyticsService.getMonthlySummary(selectedMonth, selectedYear),
                incomeService.getIncomes(selectedMonth, selectedYear),
                expenseService.getExpenses(selectedMonth, selectedYear)
            ]);

            setSummary(summaryData);
            console.log("Dashboard Summary:", summaryData);

            // Combine and sort recent activity
            const combined = [
                ...incomeData.map((i: any) => ({ ...i, type: 'income' })),
                ...expenseData.map((e: any) => ({ ...e, type: 'expense' }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            setRecentActivity(combined);

        } catch (e) {
            console.error("Failed to load dashboard data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const handleQuickAddSuccess = () => {
        setShowIncomeModal(false);
        setShowExpenseModal(false);
        setEditingIncome(null);
        setEditingExpense(null);
        loadData(); // Refresh dashboard data
    };

    return (
        <DashboardLayout>
            <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Welcome back, <span className="text-purple-400">{user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">Here's your financial overview.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button onClick={() => setShowIncomeModal(true)} variant="secondary" className="bg-[#2a2a2a] mb-0 flex-1 md:flex-none justify-center">
                        <Plus className="mr-2 h-4 w-4 text-green-400" />
                        Income
                    </Button>
                    <Button onClick={() => setShowExpenseModal(true)} className="mb-0 flex-1 md:flex-none justify-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Expense
                    </Button>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-2.5 rounded-lg bg-[#333] hover:bg-[#444] text-gray-300 transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <SmartHighlights highlights={summary?.highlights} loading={loading} />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
                <div className="lg:col-span-2">
                    <FelicaInsight />
                </div>
                <div className="lg:col-span-1">
                    <HealthScoreCard
                        score={summary?.healthScore ?? null}
                        details={summary?.healthScoreDetails}
                        loading={loading}
                    />
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg border border-gray-800 transition-transform hover:scale-[1.01]">
                    <h3 className="text-sm font-medium text-gray-400">Total Income</h3>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-bold text-green-400">
                            {loading ? "..." : `+ ${(summary?.totalIncome || 0).toFixed(2)}`}
                        </p>
                        {summary?.comparison && (
                            <div className={`flex items-center text-xs font-medium ${summary.comparison.incomeChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summary.comparison.incomeChangePercentage >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {Math.abs(summary.comparison.incomeChangePercentage)}%
                            </div>
                        )}
                    </div>
                </div>
                <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg border border-gray-800 transition-transform hover:scale-[1.01]">
                    <h3 className="text-sm font-medium text-gray-400">Total Expenses</h3>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-bold text-red-400">
                            {loading ? "..." : `- ${(summary?.totalExpense || 0).toFixed(2)}`}
                        </p>
                        {summary?.comparison && (
                            <div className={`flex items-center text-xs font-medium ${summary.comparison.expenseChangePercentage <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summary.comparison.expenseChangePercentage >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {Math.abs(summary.comparison.expenseChangePercentage)}%
                            </div>
                        )}
                    </div>
                </div>
                <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg border border-gray-800 transition-transform hover:scale-[1.01] md:col-span-2 lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-400">Savings</h3>
                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <p className={`text-2xl font-bold ${(summary?.savings || 0) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                                {loading ? "..." : `${(summary?.savings || 0).toFixed(2)}`}
                            </p>
                            <span className="text-xs text-gray-500">
                                {loading ? "..." : `${(summary?.savingsPercentage || 0)}% of income`}
                            </span>
                        </div>
                        {summary?.comparison && (
                            <div className={`flex items-center text-xs font-medium ${summary.comparison.savingsChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summary.comparison.savingsChangePercentage >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {Math.abs(summary.comparison.savingsChangePercentage)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-[#1e1e1e] border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-800">
                    {recentActivity.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No recent transactions found.
                        </div>
                    ) : (
                        recentActivity.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.type === 'income') {
                                        setEditingIncome(item);
                                        setShowIncomeModal(true);
                                    } else {
                                        setEditingExpense(item);
                                        setShowExpenseModal(true);
                                    }
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {item.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{item.source || item.category}</p>
                                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.description || item.note || item.category}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${item.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                                    {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Add / Edit Income Modal */}
            {showIncomeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-[#2a2a2a] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingIncome ? "Edit Income" : "Quick Add Income"}</h2>
                            <button
                                onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <IncomeForm
                            initialData={editingIncome}
                            onSubmit={async (data) => {
                                if (editingIncome) {
                                    await incomeService.updateIncome(editingIncome._id, data);
                                } else {
                                    await incomeService.addIncome(data);
                                }
                                handleQuickAddSuccess();
                            }}
                            onCancel={() => { setShowIncomeModal(false); setEditingIncome(null); }}
                            onDelete={editingIncome ? async () => {
                                if (window.confirm("Delete this income?")) {
                                    await incomeService.deleteIncome(editingIncome._id);
                                    handleQuickAddSuccess();
                                }
                            } : undefined}
                        />
                    </div>
                </div>
            )}

            {/* Quick Add / Edit Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-[#2a2a2a] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingExpense ? "Edit Expense" : "Quick Add Expense"}</h2>
                            <button
                                onClick={() => { setShowExpenseModal(false); setEditingExpense(null); }}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <ExpenseForm
                            initialData={editingExpense}
                            onSubmit={async (data) => {
                                if (editingExpense) {
                                    await expenseService.updateExpense(editingExpense._id, data);
                                } else {
                                    await expenseService.addExpense(data);
                                }
                                handleQuickAddSuccess();
                            }}
                            onCancel={() => { setShowExpenseModal(false); setEditingExpense(null); }}
                            onDelete={editingExpense ? async () => {
                                if (window.confirm("Delete this expense?")) {
                                    await expenseService.deleteExpense(editingExpense._id);
                                    handleQuickAddSuccess();
                                }
                            } : undefined}
                        />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
