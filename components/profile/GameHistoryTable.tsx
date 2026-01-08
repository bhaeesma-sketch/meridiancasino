import React, { useState } from 'react';
import { GameHistoryItem } from '../../types';

interface GameHistoryTableProps {
    history: GameHistoryItem[];
}

export const GameHistoryTable: React.FC<GameHistoryTableProps> = ({ history }) => {
    const [filterGame, setFilterGame] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const games = ['All', ...Array.from(new Set(history.map(item => item.game)))];

    const filteredHistory = history.filter(item => {
        if (filterGame !== 'All' && item.game !== filterGame) return false;
        return true;
    }).sort((a, b) => b.timestamp - a.timestamp);

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const currentItems = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Transaction Log</h3>

                {/* Filter */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    {games.map(game => (
                        <button
                            key={game}
                            onClick={() => { setFilterGame(game); setCurrentPage(1); }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${filterGame === game ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white/60'
                                }`}
                        >
                            {game}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-black/20">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-gray-400 font-mono uppercase tracking-wider">
                            <th className="p-3">Game</th>
                            <th className="p-3">Time</th>
                            <th className="p-3 text-right">Multiplier</th>
                            <th className="p-3 text-right">Payout</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-bold text-white">{item.game}</td>
                                    <td className="p-3 text-gray-500 font-mono">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className={`p-3 text-right font-mono font-bold ${item.multiplier >= 1 ? 'text-green-400' : 'text-gray-500'}`}>
                                        {item.multiplier.toFixed(2)}x
                                    </td>
                                    <td className={`p-3 text-right font-mono font-bold ${item.payout > 0 ? 'text-quantum-gold' : 'text-white/20'}`}>
                                        {item.payout > 0 ? `+${item.payout.toFixed(4)}` : '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500 italic">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs disabled:opacity-30"
                    >
                        Prev
                    </button>
                    <span className="text-xs text-gray-500 self-center">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
