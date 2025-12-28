import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    TrendingDown,
    PieChart,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { authService } from '../../services/auth';

export const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Wallet, label: 'Income', path: '/income' },
        { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-800 bg-[#1a1a1a] p-4 text-gray-300 md:flex">
            <div className="flex items-center gap-2 px-2 py-6">
                <div className="h-8 w-8 rounded-full bg-purple-600" />
                <span className="text-xl font-bold text-white">Finexo</span>
            </div>

            <nav className="flex-1 space-y-1 py-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white",
                                isActive && "bg-purple-600 text-white hover:bg-purple-700"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
                <LogOut className="h-5 w-5" />
                Sign Out
            </button>
        </aside>

    );
};
