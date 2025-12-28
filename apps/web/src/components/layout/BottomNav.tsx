import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    TrendingDown,
    PieChart,
    User
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const BottomNav = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Wallet, label: 'Income', path: '/income' },
        { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-800 bg-[#1a1a1a] pb-safe md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 overflow-hidden p-2 text-xs font-medium text-gray-400 transition-colors w-16",
                                isActive && "text-purple-400"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="truncate max-w-full">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
