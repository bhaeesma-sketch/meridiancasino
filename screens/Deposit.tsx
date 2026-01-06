import React, { useState, useContext } from 'react';
import { AppContext } from '../App';

interface DepositResponse {
    invoiceId: string;
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    qrCodeUrl: string;
    invoiceUrl: string;
    expiresAt: string;
}

const Deposit: React.FC = () => {
    const context = useContext(AppContext);
    const [amount, setAmount] = useState<number>(20);
    const [currency, setCurrency] = useState<string>('USDT');
    const [chain, setChain] = useState<string>('TRC20');
    const [isLoading, setIsLoading] = useState(false);
    const [depositInfo, setDepositInfo] = useState<DepositResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateDeposit = async () => {
        if (!context || !context.user) {
            setError('Please connect your wallet first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token'); // TODO: Get from context

            const response = await fetch('/api/deposit/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    chain
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create deposit');
            }

            const data = await response.json();
            setDepositInfo(data.deposit);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyAddress = () => {
        if (depositInfo) {
            navigator.clipboard.writeText(depositInfo.payAddress);
            alert('Address copied to clipboard!');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-10 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
                    Deposit Funds
                </h1>
                <p className="text-white/60">Add funds to your casino balance instantly</p>
            </div>

            {!depositInfo ? (
                /* Deposit Form */
                <div className="bg-black/60 border border-white/10 rounded-xl p-8 space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                            Amount (USD)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min={10}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white text-2xl font-bold focus:outline-none focus:border-quantum-gold"
                            placeholder="20.00"
                        />
                        <p className="text-white/50 text-xs mt-2">Minimum deposit: $10</p>
                    </div>

                    {/* Currency Selection */}
                    <div>
                        <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                            Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-quantum-gold"
                        >
                            <option value="USDT">USDT (Tether)</option>
                            <option value="TRX">TRX (Tron)</option>
                            <option value="BTC">BTC (Bitcoin)</option>
                        </select>
                    </div>

                    {/* Chain Selection */}
                    <div>
                        <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                            Blockchain Network
                        </label>
                        <select
                            value={chain}
                            onChange={(e) => setChain(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-quantum-gold"
                        >
                            <option value="TRC20">TRON (TRC20) - Lowest Fees</option>
                            <option value="ERC20">Ethereum (ERC20)</option>
                            <option value="BSC">Binance Smart Chain (BEP20)</option>
                        </select>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-400 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleCreateDeposit}
                        disabled={isLoading || amount < 10}
                        className="w-full py-4 bg-gradient-to-r from-quantum-gold to-yellow-600 text-black font-black text-lg uppercase rounded-xl hover:shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? 'Creating Invoice...' : `Deposit $${amount}`}
                    </button>
                </div>
            ) : (
                /* Deposit Info Display */
                <div className="space-y-6">
                    {/* QR Code & Address */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Send {depositInfo.payAmount} {depositInfo.payCurrency}
                        </h3>

                        {/* QR Code */}
                        <div className="bg-white rounded-xl p-6 inline-block mb-6">
                            <img
                                src={depositInfo.qrCodeUrl}
                                alt="Deposit QR Code"
                                className="w-64 h-64"
                            />
                        </div>

                        {/* Address */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-white/50 text-xs uppercase mb-2">Deposit Address</p>
                            <p className="text-white font-mono text-sm break-all mb-3">
                                {depositInfo.payAddress}
                            </p>
                            <button
                                onClick={copyAddress}
                                className="px-4 py-2 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all"
                            >
                                Copy Address
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <p className="text-blue-400 text-sm font-bold mb-2">⏳ Awaiting Payment</p>
                            <ul className="text-white/70 text-xs space-y-1 text-left">
                                <li>• Send exactly {depositInfo.payAmount} {depositInfo.payCurrency}</li>
                                <li>• Use {chain} network only</li>
                                <li>• Funds will appear after 19 confirmations (~1-3 minutes)</li>
                                <li>• Do not send from an exchange (use your personal wallet)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Start New Deposit */}
                    <button
                        onClick={() => setDepositInfo(null)}
                        className="w-full py-3 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-all"
                    >
                        Create New Deposit
                    </button>
                </div>
            )}
        </div>
    );
};

export default Deposit;
