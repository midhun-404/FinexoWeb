import { createContext, useContext, useState, type ReactNode } from 'react';

interface DateContextType {
    selectedMonth: number;
    selectedYear: number;
    setDate: (month: number, year: number) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-indexed
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const setDate = (month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const nextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(prev => prev + 1);
        } else {
            setSelectedMonth(prev => prev + 1);
        }
    };

    const prevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(prev => prev - 1);
        } else {
            setSelectedMonth(prev => prev - 1);
        }
    };

    return (
        <DateContext.Provider value={{ selectedMonth, selectedYear, setDate, nextMonth, prevMonth }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDate must be used within a DateProvider');
    }
    return context;
};
