import { useState } from 'react';
import { felicaService } from '../../services/felica';
import { Sparkles, RefreshCw } from 'lucide-react';

export const FelicaInsightCard = () => {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const data = await felicaService.getInsight();
            setInsight(data.insight);
        } catch (err) {
            console.error("Felica Error", err);
            setInsight("Felica is having trouble connecting right now. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-[#2a1b3d] to-[#1e1e1e] p-6 shadow-lg mb-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Felica AI Insight
                    </h3>
                    {!insight && !loading && (
                        <button
                            onClick={handleGenerate}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-900/20 flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Analyze Month
                        </button>
                    )}
                    {insight && (
                        <button
                            onClick={handleGenerate}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Regenerate"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-purple-300 text-sm animate-pulse">Felica is analyzing your finances...</p>
                    </div>
                ) : insight ? (
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20 text-gray-200 leading-relaxed">
                            {insight}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">
                        Get a personalized summary of your financial health for this month, powered by AI.
                    </p>
                )}
            </div>
        </div>
    );
};
