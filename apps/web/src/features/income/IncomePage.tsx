import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { incomeService, type Income, type CreateIncomeData } from '../../services/income';
import { Button } from '../../components/ui/Button';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useDate } from '../../context/DateContext';
import { IncomeForm } from './IncomeForm';

export const IncomePage = () => {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const { selectedMonth, selectedYear } = useDate();

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const data = await incomeService.getIncomes(selectedMonth, selectedYear);
            setIncomes(data);
        } catch (error) {
            console.error('Failed to fetch incomes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [selectedMonth, selectedYear]);

    const handleSubmit = async (data: CreateIncomeData) => {
        try {
            if (editingIncome) {
                await incomeService.updateIncome(editingIncome._id, data);
            } else {
                await incomeService.addIncome(data);
            }
            setShowAddModal(false);
            setEditingIncome(null);
            fetchIncomes();
        } catch (error) {
            console.error('Failed to save income', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this income?")) return;
        try {
            await incomeService.deleteIncome(id);
            fetchIncomes();
        } catch (error) {
            console.error("Failed to delete income", error);
        }
    };

    const handleEdit = (income: Income) => {
        setEditingIncome(income);
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setEditingIncome(null);
        setShowAddModal(true);
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Income</h1>
                    <p className="text-gray-400">Manage your earnings and revenue sources</p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Income
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
                                        <th className="px-6 py-4 font-medium">Source</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Recurring</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {incomes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <p className="mb-4">No income records found for this month.</p>
                                                <Button variant="ghost" onClick={openAddModal} className="text-purple-400 hover:text-purple-300">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Income
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : (
                                        incomes.map((income) => (
                                            <tr key={income._id} className="hover:bg-[#252525]">
                                                <td className="px-6 py-4 text-white">
                                                    {new Date(income.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-white">{income.source}</td>
                                                <td className="px-6 py-4 font-medium text-green-400">
                                                    + {income.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {income.isRecurring ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                                                            Recurring
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                                                            One-time
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(income)}
                                                            className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(income._id)}
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
                        {incomes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="mb-4">No income records found for this month.</p>
                                <Button variant="ghost" onClick={openAddModal} className="text-purple-400 hover:text-purple-300">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Income
                                </Button>
                            </div>
                        ) : (
                            incomes.map((income) => (
                                <div key={income._id} className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-white">{income.source}</h3>
                                            <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="font-bold text-green-400">+ {income.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            {income.isRecurring && (
                                                <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                                                    Recurring
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(income)}
                                                className="p-2 hover:bg-[#333] rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(income._id)}
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
                            <h2 className="text-xl font-bold text-white">{editingIncome ? "Edit Income" : "Add Income"}</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <IncomeForm
                            initialData={editingIncome}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowAddModal(false)}
                            onDelete={editingIncome ? () => {
                                handleDelete(editingIncome._id);
                                setShowAddModal(false);
                            } : undefined}
                        />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
