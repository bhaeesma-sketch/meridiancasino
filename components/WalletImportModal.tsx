import React, { useState } from 'react';

interface WalletImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (address: string, walletType: 'imported') => void;
}

export const WalletImportModal: React.FC<WalletImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'private' | 'seed'>('private');
    const [privateKey, setPrivateKey] = useState('');
    const [seedPhrase, setSeedPhrase] = useState('');
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    if (!isOpen) return null;

    const handleImportPrivateKey = async () => {
        setError('');
        setIsImporting(true);
        try {
            if (!privateKey || privateKey.length < 64) throw new Error('Invalid private key format');

            // Simulation for address derivation
            const mockAddress = '0x' + privateKey.substring(0, 40);
            onSuccess(mockAddress, 'imported');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to import wallet');
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportSeedPhrase = async () => {
        setError('');
        setIsImporting(true);
        try {
            const words = seedPhrase.trim().split(/\s+/);
            if (words.length !== 12 && words.length !== 24) throw new Error('Seed phrase must be 12 or 24 words');

            const mockAddress = '0x' + words[0].substring(0, 40).padEnd(40, '0');
            onSuccess(mockAddress, 'imported');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to import wallet');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-deep-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl animate-holo-entry">
                {/* Ambient Glows */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-quantum-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-plasma-purple/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter italic">
                                Secure <span className="text-quantum-gold">Vault</span>
                            </h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-bold">Import Hardware Key</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-8 mb-6">
                    <button
                        onClick={() => setActiveTab('private')}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-lg ${activeTab === 'private'
                            ? 'bg-gradient-to-r from-yellow-400 to-quantum-gold text-black shadow-gold-glow'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                            }`}
                    >
                        Private Key
                    </button>
                    <button
                        onClick={() => setActiveTab('seed')}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-lg ${activeTab === 'seed'
                            ? 'bg-gradient-to-r from-yellow-400 to-quantum-gold text-black shadow-gold-glow'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                            }`}
                    >
                        Seed Phrase
                    </button>
                </div>

                <div className="px-8 pb-10 space-y-6">
                    {/* Security Alert */}
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                        <div className="relative flex gap-4">
                            <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-red-400">gpp_maybe</span>
                            </div>
                            <div>
                                <p className="text-red-400 font-black text-xs uppercase tracking-wider mb-1">Quantum Security Alert</p>
                                <p className="text-white/50 text-[10px] leading-relaxed">
                                    Keys are never sent to our servers. They are processed locally and discarded immediately after session initialization.
                                </p>
                            </div>
                        </div>
                    </div>

                    {activeTab === 'private' ? (
                        <div className="space-y-6 animate-deep-fade-up">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Authentication Key</label>
                                <textarea
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    placeholder="Enter your 64-character private key..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-quantum-gold text-sm font-mono resize-none focus:border-quantum-gold/50 focus:outline-none transition-all duration-500 shadow-inner"
                                    rows={3}
                                />
                            </div>
                            <button
                                onClick={handleImportPrivateKey}
                                disabled={isImporting || !privateKey}
                                className="w-full h-16 bg-white text-black font-black uppercase text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-2 group"
                            >
                                {isImporting ? (
                                    <div className="animate-spin size-5 border-2 border-black border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <span>Initialize Session</span>
                                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">bolt</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-deep-fade-up">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Mnemonic Sequence</label>
                                <textarea
                                    value={seedPhrase}
                                    onChange={(e) => setSeedPhrase(e.target.value)}
                                    placeholder="Enter your 12 or 24-word seed phrase..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-quantum-gold text-sm font-mono resize-none focus:border-quantum-gold/50 focus:outline-none transition-all duration-500 shadow-inner"
                                    rows={4}
                                />
                            </div>
                            <button
                                onClick={handleImportSeedPhrase}
                                disabled={isImporting || !seedPhrase}
                                className="w-full h-16 bg-white text-black font-black uppercase text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-2 group"
                            >
                                {isImporting ? (
                                    <div className="animate-spin size-5 border-2 border-black border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <span>Initialize Session</span>
                                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">bolt</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-400/20 border border-red-400/30 rounded-2xl animate-shake">
                            <p className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
