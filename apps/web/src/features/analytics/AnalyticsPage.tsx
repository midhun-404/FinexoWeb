import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analytics';
import type { MonthlySummary, TimelineData, DailyData } from '../../services/analytics';
import { DailyFlowChart } from './DailyFlowChart';
import { TransactionReport } from './TransactionReport';
import { FelicaInsightCard } from '../dashboard/FelicaInsightCard';
import { useDate } from '../../context/DateContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsPage = () => {
    const { selectedMonth, selectedYear } = useDate();
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [timeline, setTimeline] = useState<TimelineData[]>([]);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'intent' | 'flow'>('overview');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Context provides 1-indexed month (1-12). API expects 1-12.
                const apiMonth = selectedMonth;

                const [sumData, timeData, dayData] = await Promise.all([
                    analyticsService.getMonthlySummary(apiMonth, selectedYear),
                    analyticsService.getTimeline(),
                    analyticsService.getDailyBreakdown(apiMonth, selectedYear)
                ]);
                setSummary(sumData);
                setTimeline(timeData);
                setDailyData(dayData);
            } catch (err) {
                console.error("Error fetching analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    if (loading) return <DashboardLayout><div className="text-white p-8">Loading analytics...</div></DashboardLayout>;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'categories', label: 'Categories' },
        { id: 'intent', label: 'Intent' },
        { id: 'flow', label: 'Flow' },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-gray-400">Deep dive into your financial data for {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#1e1e1e] text-gray-400 border border-gray-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* AI Insight Card */}
            <FelicaInsightCard />

            {/* Daily Money Flow Chart (Full Width) */}
            <div className={`mb-6 ${activeTab === 'flow' ? 'block' : 'hidden md:block'}`}>
                <DailyFlowChart data={dailyData} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
                {/* Income vs Expense Bar Chart */}
                <div className={`rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg ${activeTab === 'overview' ? 'block' : 'hidden md:block'}`}>
                    <h3 className="mb-4 text-lg font-medium text-white">Income vs Expense (This Month)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Income', amount: summary?.totalIncome || 0 },
                                { name: 'Expense', amount: summary?.totalExpense || 0 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                                />
                                <Bar dataKey="amount" fill="#8884d8">
                                    {
                                        [0, 1].map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Timeline Line Chart */}
                <div className={`rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg ${activeTab === 'overview' ? 'block' : 'hidden md:block'}`}>
                    <h3 className="mb-4 text-lg font-medium text-white">Money Flow (Last 6 Months)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeline}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution Pie Chart */}
                <div className={`rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg ${activeTab === 'categories' ? 'block' : 'hidden md:block'}`}>
                    <h3 className="mb-4 text-lg font-medium text-white">Expense Categories</h3>
                    {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.categoryBreakdown as any[]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {summary.categoryBreakdown.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500">
                            No expense data available
                        </div>
                    )}
                </div>

                {/* Intent Distribution Pie Chart */}
                <div className={`rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg ${activeTab === 'intent' ? 'block' : 'hidden md:block'}`}>
                    <h3 className="mb-4 text-lg font-medium text-white">Expense Intent</h3>
                    {summary?.intentBreakdown && summary.intentBreakdown.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.intentBreakdown as any[]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="amount"
                                        nameKey="intent"
                                        label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {summary.intentBreakdown.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500">
                            No expense data available
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Report (Search & Filter) */}
            <TransactionReport />

        </DashboardLayout>
    );
};
