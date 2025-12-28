import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { expenseService, type Expense, type CreateExpenseData } from '../../services/expense';
import { Button } from '../../components/ui/Button';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useDate } from '../../context/DateContext';
import { ExpenseForm } from './ExpenseForm';

export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const { selectedMonth, selectedYear } = useDate();

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseService.getExpenses(selectedMonth, selectedYear);
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [selectedMonth, selectedYear]);

    const handleSubmit = async (data: CreateExpenseData) => {
        try {
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense._id, data);
            } else {
                await expenseService.addExpense(data);
            }
            setShowAddModal(false);
            setEditingExpense(null);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to save expense', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await expenseService.deleteExpense(id);
            fetchExpenses();
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setShowAddModal(true);
    };

    const intentColors = {
        need: 'text-red-400',
        want: 'text-yellow-400',
        emergency: 'text-orange-500',
        impulse: 'text-purple-400'
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Expenses</h1>
                    <p className="text-gray-400">Track your spending and habits</p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            {loading ? (
                <div className="text-white">Loading...</div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#252525] text-xs uppercase text-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Intent</th>
                                        <th className="px-6 py-4 font-medium">Note</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No expense records found for this month.
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense) => (
                                            <tr key={expense._id} className="hover:bg-[#252525]">
                                                <td className="px-6 py-4 text-white">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{expense.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`capitalize ${intentColors[expense.intent]}`}>
                                                        {expense.intent}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{expense.note}</td>
                                                <td className="px-6 py-4 font-medium text-red-400">
                                                    - {expense.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(expense)}
                                                            className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense._id)}
                                                            className="p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {expenses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No expense records found for this month.
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <div key={expense._id} className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-white">{expense.category}</h3>
                                            <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="font-bold text-red-400">- {expense.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-medium capitalize ${intentColors[expense.intent]}`}>
                                                {expense.intent}
                                            </span>
                                            {expense.note && (
                                                <p className="text-xs text-gray-500">{expense.note}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="p-2 hover:bg-[#333] rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-[#2a2a2a] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <ExpenseForm
                            initialData={editingExpense}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowAddModal(false)}
                            onDelete={editingExpense ? () => {
                                handleDelete(editingExpense._id);
                                setShowAddModal(false);
                            } : undefined}
                        />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
