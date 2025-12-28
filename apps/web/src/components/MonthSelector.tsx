import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDate } from '../context/DateContext';

export const MonthSelector = () => {
    const { selectedMonth, selectedYear, nextMonth, prevMonth } = useDate();

    const date = new Date(selectedYear, selectedMonth - 1);
    const monthName = date.toLocaleString('default', { month: 'long' });

    return (
        <div className="flex items-center space-x-4 bg-[#252525] rounded-lg px-4 py-2 border border-gray-700">
            <button
                onClick={prevMonth}
                className="p-1 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-white font-medium min-w-[140px] text-center">
                {monthName} {selectedYear}
            </span>
            <button
                onClick={nextMonth}
                className="p-1 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
};
