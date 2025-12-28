import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4 text-white">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#2a2a2a] p-8 shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">{title}</h2>
                    <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};
