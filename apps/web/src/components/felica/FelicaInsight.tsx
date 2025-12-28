import { useEffect, useState } from 'react';
import { felicaService } from '../../services/felica';
import { Sparkles, Bot } from 'lucide-react';

export const FelicaInsight = () => {
    const [insight, setInsight] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                const data = await felicaService.getInsight();
                setInsight(data.insight);
            } catch (error) {
                console.error("Failed to get Felica insight", error);
                setInsight("I'm having trouble analyzing your data right now.");
            } finally {
                setLoading(false);
            }
        };
        fetchInsight();
    }, []);

    return (
        <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-[#1e1e1e] to-[#2a1b3d] p-6 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                    <Bot className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                        Felica's Insight
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                    </h3>
                    <div className="mt-2 text-gray-300">
                        {loading ? (
                            <div className="flex items-center gap-1">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        ) : (
                            <p className="leading-relaxed">"{insight}"</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-blue-500/10 blur-xl"></div>
        </div>
    );
};
