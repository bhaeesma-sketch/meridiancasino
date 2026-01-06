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
            // Basic validation
            if (!privateKey || privateKey.length < 64) {
                throw new Error('Invalid private key format');
            }

            // In a real app, you'd use ethers.js or tronweb to derive the address
            // For now, we'll simulate it
            const mockAddress = '0x' + privateKey.substring(0, 40);

            // Store in localStorage (encrypted in production!)
            localStorage.setItem('imported_wallet_pk', privateKey);
            localStorage.setItem('imported_wallet_address', mockAddress);

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
            if (words.length !== 12 && words.length !== 24) {
                throw new Error('Seed phrase must be 12 or 24 words');
            }

            // In a real app, use ethers.js or tronweb to derive from mnemonic
            const mockAddress = '0x' + words[0].substring(0, 40).padEnd(40, '0');

            localStorage.setItem('imported_wallet_seed', seedPhrase);
            localStorage.setItem('imported_wallet_address', mockAddress);

            onSuccess(mockAddress, 'imported');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to import wallet');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-space-black border border-quantum-gold/30 rounded-2xl shadow-gold-glow overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">
                            Import Wallet
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Security Warning */}
                <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-red-400 flex-shrink-0">warning</span>
                        <div>
                            <p className="text-red-400 font-bold text-sm mb-1">Security Warning</p>
                            <p className="text-white/70 text-xs">
                                Never share your private key or seed phrase. This information is processed locally and never sent to any server.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-6 pb-0">
                    <button
                        onClick={() => setActiveTab('private')}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'private'
                                ? 'bg-quantum-gold text-black'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        Private Key
                    </button>
                    <button
                        onClick={() => setActiveTab('seed')}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'seed'
                                ? 'bg-quantum-gold text-black'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        Seed Phrase
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'private' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm font-bold mb-2">
                                    Private Key
                                </label>
                                <textarea
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    placeholder="Enter your private key (64 characters)"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono resize-none focus:border-quantum-gold/50 focus:outline-none transition-colors"
                                    rows={3}
                                />
                            </div>
                            <button
                                onClick={handleImportPrivateKey}
                                disabled={isImporting || !privateKey}
                                className="w-full py-3 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isImporting ? 'Importing...' : 'Import Wallet'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm font-bold mb-2">
                                    Seed Phrase (12 or 24 words)
                                </label>
                                <textarea
                                    value={seedPhrase}
                                    onChange={(e) => setSeedPhrase(e.target.value)}
                                    placeholder="Enter your seed phrase separated by spaces"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono resize-none focus:border-quantum-gold/50 focus:outline-none transition-colors"
                                    rows={4}
                                />
                            </div>
                            <button
                                onClick={handleImportSeedPhrase}
                                disabled={isImporting || !seedPhrase}
                                className="w-full py-3 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isImporting ? 'Importing...' : 'Import Wallet'}
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
