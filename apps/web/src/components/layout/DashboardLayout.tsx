import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FelicaChatWidget } from '../../features/chat/FelicaChatWidget';

import { MonthSelector } from '../MonthSelector';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#121212]">
            <Sidebar />
            <div className="flex flex-col min-h-screen md:ml-64 pb-16 md:pb-0 transition-all duration-300">
                <header className="sticky top-0 z-20 bg-[#121212]/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
                    <div className="text-gray-400 text-sm">Finexo Financial Suite</div>
                    <MonthSelector />
                </header>
                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>
            <BottomNav />
            <FelicaChatWidget />
        </div>
    );
};
