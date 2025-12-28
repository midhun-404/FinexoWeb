import React, { useState, useEffect } from 'react';
import { type CreateIncomeData, type Income } from '../../services/income';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2 } from 'lucide-react';

interface IncomeFormProps {
    initialData?: Income | null;
    onSubmit: (data: CreateIncomeData) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ initialData, onSubmit, onCancel, onDelete }) => {
    const [formData, setFormData] = useState<CreateIncomeData>({
        amount: 0,
        source: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                amount: initialData.amount,
                source: initialData.source,
                date: new Date(initialData.date).toISOString().split('T')[0],
                isRecurring: initialData.isRecurring
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Source"
                placeholder="e.g. Salary, Freelance"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                required
            />

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

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-600 bg-[#333] text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-300">
                    This is a recurring monthly income
                </label>
            </div>

            <div className="mt-6 flex gap-3">
                {initialData && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="px-3"
                        onClick={onDelete}
                        title="Delete Income"
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
                    {initialData ? "Update Income" : "Save Income"}
                </Button>
            </div>
        </form>
    );
};
