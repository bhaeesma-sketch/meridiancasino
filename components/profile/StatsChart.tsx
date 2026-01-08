import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GameHistoryItem } from '../../types';

interface StatsChartProps {
    history: GameHistoryItem[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ history }) => {
    // Process history data for chart
    // We want cumulative profit/loss over time
    // Sort by time ascending
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

    let cumulativePnL = 0;
    const data = sortedHistory.map((item, index) => {
        // Payout includes bet? Assuming payout is total return.
        // We don't have bet amount in history item :(
        // We have payout. If payout > 0 it's a win.
        // But we don't know the wager from this interface.
        // Actually we assume wager is deducted separately or part of history?
        // For now let's just chart "Payouts" or assume a fixed bet relative to payout for demo?
        // Or just chart "Winning Multipliers".

        // Let's chart "Performance Index" based on multipliers.
        // >1x is win, <1x is loss (usually 0).
        // Let's accumulate (Multiplier - 1). 
        // e.g. 2x -> +1. 0x -> -1.

        const score = item.multiplier > 0 ? item.multiplier - 1 : -1;
        cumulativePnL += score;

        return {
            name: index + 1,
            pnl: cumulativePnL,
            date: new Date(item.timestamp).toLocaleTimeString()
        };
    });

    // If no data, provide mock
    if (data.length === 0) {
        data.push({ name: 1, pnl: 0, date: 'Start' });
    }

    return (
        <div className="w-full h-[300px] bg-black/40 border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Vector</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#22d3ee" fill="url(#colorPnL)" strokeWidth={2} />
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
