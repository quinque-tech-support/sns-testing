import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-semibold text-gray-900 mb-2">{value}</p>
                    {change && (
                        <div className="flex items-center gap-1">
                            <span
                                className={`text-xs font-medium ${trend === 'up'
                                        ? 'text-green-600'
                                        : trend === 'down'
                                            ? 'text-red-600'
                                            : 'text-gray-600'
                                    }`}
                            >
                                {change}
                            </span>
                            <span className="text-xs text-gray-500">vs last week</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-600" />
                </div>
            </div>
        </div>
    );
}
