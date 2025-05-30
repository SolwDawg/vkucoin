import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  backgroundColor = "bg-blue-50 dark:bg-blue-900/20",
  subtitle,
  trend,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className={`${backgroundColor} p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`h-8 w-8 ${iconColor}`} />
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </p>
          </div>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {subtitle}
        </p>
      )}
      
      {trend && (
        <div className={`flex items-center text-sm ${getTrendColor(trend.direction)}`}>
          <span className="mr-1">{getTrendIcon(trend.direction)}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            từ tháng trước
          </span>
        </div>
      )}
    </div>
  );
}; 