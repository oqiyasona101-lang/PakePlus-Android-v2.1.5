
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistributionChartProps {
  data: Record<number, number>;
  highlighted: number[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data, highlighted }) => {
  const chartData = Object.entries(data)
    .map(([num, count]) => ({
      number: num,
      count: count,
      isHighlighted: highlighted.includes(parseInt(num))
    }))
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className="h-64 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="number" 
            stroke="#94a3b8" 
            fontSize={12}
            interval={0}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="count">
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isHighlighted ? '#fbbf24' : '#3b82f6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
