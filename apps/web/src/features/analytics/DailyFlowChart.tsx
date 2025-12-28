import React from 'react';
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line
} from 'recharts';
import type { DailyData } from '../../services/analytics';

interface DailyFlowChartProps {
    data: DailyData[];
}

export const DailyFlowChart: React.FC<DailyFlowChartProps> = ({ data }) => {
    return (
        <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Daily Money Flow & Cash Burn</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="day"
                            stroke="#888"
                            label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                            formatter={(value: number) => value.toFixed(2)}
                            labelFormatter={(label) => `Day ${label}`}
                        />
                        <Bar dataKey="income" name="Income" fill="#4ade80" barSize={20} />
                        <Bar dataKey="expense" name="Expense" fill="#f87171" barSize={20} />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            name="Net Balance (Cumulative)"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                        <Line type="monotone" dataKey="balance" stroke="#8884d8" dot={false} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
