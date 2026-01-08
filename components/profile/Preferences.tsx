import React, { useState } from 'react';

export const Preferences: React.FC = () => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [streamerMode, setStreamerMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);

    return (
        <div className="flex flex-col gap-6 p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Interface Customization</h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white">volume_up</span>
                        <span className="font-bold text-white">Sound Effects</span>
                    </div>
                </div>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${soundEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
            </div>

            {/* Streamer Mode */}
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">videocam</span>
                        <span className="font-bold text-white">Streamer Mode</span>
                    </div>
                    <span className="text-xs text-gray-500">Hide sensitive information from screen</span>
                </div>
                <button
                    onClick={() => setStreamerMode(!streamerMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${streamerMode ? 'bg-purple-500' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${streamerMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
            </div>
        </div>
    );
};
