import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

interface SmartHighlightsProps {
    highlights?: string[];
    loading?: boolean;
}

export const SmartHighlights: React.FC<SmartHighlightsProps> = ({ highlights, loading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!highlights || highlights.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % highlights.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [highlights]);

    const nextHighlight = () => {
        if (!highlights) return;
        setCurrentIndex((prev) => (prev + 1) % highlights.length);
    };

    const prevHighlight = () => {
        if (!highlights) return;
        setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
    };

    if (loading) {
        return (
            <div className="mb-6 rounded-xl border border-gray-800 bg-[#1e1e1e] p-4 shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-800 rounded-full"></div>
                    <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!highlights || highlights.length === 0) {
        return null; // Don't show if no highlights
    }

    // Determine color based on content keywords
    const getHighlightColor = (text: string) => {
        if (text.toLowerCase().includes('warning') || text.toLowerCase().includes('exceed')) return 'text-red-400 border-red-500/30 bg-red-500/10';
        if (text.toLowerCase().includes('great') || text.toLowerCase().includes('excellent') || text.toLowerCase().includes('outstanding')) return 'text-green-400 border-green-500/30 bg-green-500/10';
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    };

    const currentText = highlights[currentIndex];
    const colorClass = getHighlightColor(currentText);

    return (
        <div className={`mb-8 relative overflow-hidden rounded-xl border px-4 py-3 transition-colors duration-500 ${colorClass}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 mr-4">
                    <Lightbulb className="h-5 w-5 flex-shrink-0" />
                    <p className="font-medium text-sm md:text-base animate-in fade-in slide-in-from-right-4 duration-500 key={currentIndex}">
                        {currentText}
                    </p>
                </div>

                {highlights.length > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); prevHighlight(); }}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 opacity-70" />
                        </button>
                        <span className="text-xs opacity-50 font-mono w-8 text-center">
                            {currentIndex + 1}/{highlights.length}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextHighlight(); }}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4 opacity-70" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
