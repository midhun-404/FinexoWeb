import React from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HealthScoreCardProps {
    score: number | null;
    details?: {
        savingsScore: number;
        impulseScore: number;
        cashFlowScore: number;
        impulsePercentage: number;
    };
    loading?: boolean;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, details, loading }) => {
    if (loading) {
        return (
            <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg animate-pulse h-[200px]">
                <div className="h-4 w-32 bg-gray-800 rounded mb-4"></div>
                <div className="h-16 w-16 bg-gray-800 rounded-full mx-auto mb-4"></div>
            </div>
        );
    }

    if (score === null || score === undefined) {
        return (
            <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg h-[240px] flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-10 w-10 text-gray-600 mb-3" />
                <h3 className="text-gray-300 font-medium">No Data Available</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Add income or expenses to see your health score.</p>
            </div>
        );
    }

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-400';
        if (s >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return 'Excellent';
        if (s >= 50) return 'Fair';
        return 'Needs Work';
    };

    const CircleProgress = ({ percentage }: { percentage: number }) => {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        let colorClass = 'stroke-red-500';
        if (percentage >= 80) colorClass = 'stroke-green-500';
        else if (percentage >= 50) colorClass = 'stroke-yellow-500';

        return (
            <div className="relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                        className="text-gray-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="64"
                        cy="64"
                    />
                    <circle
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="64"
                        cy="64"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                        {percentage}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    Financial Health
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-800 ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
                <CircleProgress percentage={score} />

                <div className="flex-1 w-full space-y-3">
                    {details && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Savings Rate
                                </span>
                                <span className="text-white font-medium">{details.savingsScore}/40 pts</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full"
                                    style={{ width: `${(details.savingsScore / 40) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Impulse Control
                                </span>
                                <span className="text-white font-medium">{details.impulseScore}/40 pts</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div
                                    className="bg-purple-500 h-1.5 rounded-full"
                                    style={{ width: `${(details.impulseScore / 40) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" /> Cash Flow
                                </span>
                                <span className="text-white font-medium">{details.cashFlowScore}/20 pts</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{ width: `${(details.cashFlowScore / 20) * 100}%` }}
                                ></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
