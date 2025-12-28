import React, { useState, useEffect } from 'react';
import { type CreateExpenseData, type Expense } from '../../services/expense';
import { felicaService } from '../../services/felica';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sparkles, Trash2 } from 'lucide-react';

interface ExpenseFormProps {
    initialData?: Expense | null;
    onSubmit: (data: CreateExpenseData) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, onDelete }) => {
    const [formData, setFormData] = useState<CreateExpenseData>({
        amount: 0,
        category: '',
        intent: 'need',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                amount: initialData.amount,
                category: initialData.category,
                intent: initialData.intent,
                date: new Date(initialData.date).toISOString().split('T')[0],
                note: initialData.note
            });
        }
    }, [initialData]);

    const handleAiSuggest = async () => {
        if (!formData.note) return;
        setAiLoading(true);
        try {
            const suggestion = await felicaService.suggestCategorization(formData.note);
            if (suggestion) {
                setFormData(prev => ({
                    ...prev,
                    category: suggestion.category,
                    intent: suggestion.intent as any
                }));
            }
        } catch (e) {
            console.error("Felica suggestion failed", e);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
            />

            <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
            />

            <div className="relative">
                <Input
                    label="Note"
                    placeholder="e.g. Starbucks coffee"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
                <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={!formData.note || aiLoading}
                    className="absolute right-0 top-0 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                    <Sparkles className="h-3 w-3" />
                    {aiLoading ? "Thinking..." : "Ask Felica"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Category"
                    placeholder="e.g. Food"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Intent</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-gray-600 bg-[#333] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.intent}
                        onChange={(e) => setFormData({ ...formData, intent: e.target.value as any })}
                    >
                        <option value="need">Need</option>
                        <option value="want">Want</option>
                        <option value="emergency">Emergency</option>
                        <option value="impulse">Impulse</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                {initialData && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="px-3"
                        onClick={onDelete}
                        title="Delete Expense"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 text-white">
                    {initialData ? "Update Expense" : "Save Expense"}
                </Button>
            </div>
        </form>
    );
};
