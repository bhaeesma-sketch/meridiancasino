import React, { useState } from 'react';

export const SecuritySettings: React.FC = () => {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [emailAlerts, setEmailAlerts] = useState(true);

    return (
        <div className="flex flex-col gap-6 p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Security Protocols</h3>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-cyan-400">lock_person</span>
                        <span className="font-bold text-white">Two-Factor Authentication</span>
                    </div>
                    <span className="text-xs text-gray-500">Secure your account with Quantum 2FA</span>
                </div>
                <button
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${is2FAEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-400">mail</span>
                        <span className="font-bold text-white">Login Alerts</span>
                    </div>
                    <span className="text-xs text-gray-500">Receive notifications for new device logins</span>
                </div>
                <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${emailAlerts ? 'bg-orange-500' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
            </div>

            {/* Session Logs (Mock) */}
            <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Sessions</h4>
                <div className="space-y-2">
                    {[
                        { device: 'MacBook Pro (Quantum)', location: 'New York, US', ip: '192.168.1.1', active: true },
                        { device: 'iPhone 15', location: 'New York, US', ip: '192.168.1.5', active: false },
                    ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 font-mono text-xs">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">{session.device.includes('iPhone') ? 'smartphone' : 'laptop'}</span>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{session.device}</span>
                                    <span className="text-gray-500">{session.location} • {session.ip}</span>
                                </div>
                            </div>
                            {session.active ? (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[9px] uppercase font-bold">Current</span>
                            ) : (
                                <span className="text-gray-600">Last seen 2h ago</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
