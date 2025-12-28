import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/analytics';
import type { SearchResult, TransactionFilter } from '../../services/analytics';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useDate } from '../../context/DateContext';

export const TransactionReport = () => {
    const { selectedMonth, selectedYear } = useDate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('All');
    const [intent, setIntent] = useState('All');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const filter: TransactionFilter = {
                month: selectedMonth, // Context is 1-indexed
                year: selectedYear,
                searchText: searchText || undefined,
                category: category !== 'All' ? category : undefined,
                intent: intent !== 'All' ? intent : undefined,
                minAmount: minAmount ? Number(minAmount) : undefined,
                maxAmount: maxAmount ? Number(maxAmount) : undefined,
            };
            // Note: If using global date context, we might default to selected month. 
            // But usually "Search" implies flexible date. 
            // However, the dashboard is month-centric. Let's keep it consistent with the month unless cleared.
            // Actually, for a report, users might want to search across all time.
            // Let's stick to selected month as default but allow clearing it? 
            // For now, let's strictly respect the global date context to match the page theme.

            const data = await analyticsService.searchTransactions(filter);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, searchText, category, intent, minAmount, maxAmount]);

    // Initial fetch when month changes or manually triggered
    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, selectedYear]); // Only refetch on global date change automatically

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTransactions();
    };

    return (
        <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-400" />
                    Transaction Report
                </h3>
                <button
                    onClick={fetchTransactions}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5 mb-6">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search description, notes..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full rounded-lg bg-black/20 border border-gray-700 pl-9 pr-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg bg-black/20 border border-gray-700 px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none appearance-none"
                >
                    <option value="All">All Categories</option>
                    <option value="Income">Income Sources</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Housing">Housing</option>
                    <option value="Other">Other</option>
                </select>

                <select
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    className="rounded-lg bg-black/20 border border-gray-700 px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none appearance-none"
                >
                    <option value="All">All Intents</option>
                    <option value="needs">Needs</option>
                    <option value="wants">Wants</option>
                    <option value="savings">Savings</option>
                    <option value="impulse">Impulse</option>
                </select>

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min $"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full rounded-lg bg-black/20 border border-gray-700 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                    <input
                        type="number"
                        placeholder="Max $"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full rounded-lg bg-black/20 border border-gray-700 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </form>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-900/50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Intent</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Loading transactions...
                                </td>
                            </tr>
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No transactions found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            results.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                            <span className="capitalize">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-gray-800 text-xs border border-gray-700">
                                            {item.category || item.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={item.description || item.note}>
                                        {item.description || item.note || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.intent ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.intent === 'needs' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                item.intent === 'wants' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    item.intent === 'savings' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {item.intent.toUpperCase()}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium ${item.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                                        {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <p>Showing {results.length} transactions</p>
                {/* Pagination could go here */}
            </div>
        </div>
    );
};
