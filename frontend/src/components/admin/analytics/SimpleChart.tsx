import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: DataPoint[];
  type: 'line' | 'bar';
  title: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  title,
  height = 300,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Không có dữ liệu để hiển thị
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const chartWidth = 600;
  const chartHeight = height - 100;
  const padding = 40;

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${valuePrefix}${(value / 1000000).toFixed(1)}M${valueSuffix}`;
    } else if (value >= 1000) {
      return `${valuePrefix}${(value / 1000).toFixed(1)}K${valueSuffix}`;
    }
    return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
  };

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * (chartHeight - padding * 2);
  };

  const getYPosition = (value: number) => {
    return chartHeight - padding - getBarHeight(value);
  };

  const barWidth = (chartWidth - padding * 2) / data.length * 0.8;
  const barSpacing = (chartWidth - padding * 2) / data.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={height} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = chartHeight - padding - (chartHeight - padding * 2) * ratio;
            const value = minValue + range * ratio;
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-gray-300 dark:text-gray-600"
                />
                <text
                  x={padding - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
          />
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
          />

          {type === 'bar' ? (
            // Bar chart
            data.map((point, index) => {
              const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
              const barHeight = getBarHeight(point.value);
              const y = getYPosition(point.value);
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={point.color || '#3B82F6'}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - padding + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })
          ) : (
            // Line chart
            <>
              <polyline
                points={data
                  .map((point, index) => {
                    const x = padding + index * barSpacing + barSpacing / 2;
                    const y = getYPosition(point.value);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                className="opacity-80"
              />
              {data.map((point, index) => {
                const x = padding + index * barSpacing + barSpacing / 2;
                const y = getYPosition(point.value);
                
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={point.color || '#3B82F6'}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={x}
                      y={chartHeight - padding + 15}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}; 