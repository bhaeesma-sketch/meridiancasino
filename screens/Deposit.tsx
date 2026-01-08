import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { supabase } from '../services/supabase';

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
    const [isProcessing, setIsProcessing] = useState(false);
    const [serverMode, setServerMode] = useState<'TEST' | 'PRODUCTION' | null>(null);

    const handleCreateDeposit = async () => {
        if (!context || !context.user) {
            setError('Please connect your wallet first');
            return;
        }

        if (isProcessing) return; // Prevent double-clicks

        setIsLoading(true);
        setIsProcessing(true);
        setError(null);
        sounds.playClick();

        try {
            // PRODUCTION: Call Supabase Edge Function
            const { data, error: fnError } = await supabase.functions.invoke('create-deposit', {
                body: {
                    amount,
                    currencyType: currency,
                    network: chain,
                    walletAddress: context.user.address
                }
            });

            if (fnError) throw fnError;
            if (data.error) throw new Error(data.error);

            setDepositInfo(data.deposit);
            setServerMode(data.mode);

        } catch (err: any) {
            console.warn("Backend Error:", err);

            // If it's a specific config error from our backend, SHOW IT
            if (err.message && err.message.includes('CONFIG_ERROR')) {
                setError(err.message.replace('CONFIG_ERROR: ', ''));
                setIsLoading(false);
                return; // Do not fallback to demo
            }

            // FALLBACK: SIMULATION MODE (Only for network/dev issues)
            console.warn("Using Simulation Mode due to:", err.message);
            setTimeout(() => {
                const mockAddress = chain === 'TRC20'
                    ? 'T9yCDQr531f82y5235235TRoNAdDrEssHere'
                    : '0x12345678901234567890EthereumAddressHere';

                setDepositInfo({
                    invoiceId: `DEP-${Math.floor(Math.random() * 100000)}`,
                    payAddress: mockAddress,
                    payAmount: amount,
                    payCurrency: currency,
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${mockAddress}`,
                    invoiceUrl: '#',
                    expiresAt: new Date(Date.now() + 3600000).toISOString()
                });
            }, 1000);
        } finally {
            setIsLoading(false);
            setIsProcessing(false);
        }
    };

    const handleSimulatePayment = () => {
        if (!context) return;
        sounds.playWin();
        // NOTE: In production, you would NOT expose this. 
        // This is only for the "Simulation Mode" fallback or Dev environment.
        context.updateBalance(amount);
        context.processFirstDeposit(amount);
        alert(`Successfully simulated deposit of $${amount}!`);
        setDepositInfo(null);
    };

    const copyAddress = () => {
        if (depositInfo) {
            navigator.clipboard.writeText(depositInfo.payAddress);
            alert('Address copied to clipboard!');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-10 w-full relative">
            {serverMode === 'TEST' && (
                <div className="mb-6 bg-red-500/20 border-2 border-red-500 text-red-500 p-4 rounded-xl text-center font-black animate-pulse tracking-widest uppercase">
                    ⚠️ TEST MODE — MICRO DEPOSITS ENABLED ⚠️
                </div>
            )}

            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Access Terminal</h1>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/50 text-[10px] font-mono uppercase">
                            Secure Link: Active
                        </div>
                    </div>
                </div>
                <p className="text-white/60 text-sm">Convert your crypto to game credits instantly via the global quantum gateway.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {!depositInfo ? (
                    <>
                        {/* Information Card & Binance Guide */}
                        <div className="space-y-6">
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-quantum-gold">info</span>
                                    Binance / Exchange Users
                                </h3>
                                <div className="space-y-4 text-sm text-white/70">
                                    <p>You can deposit directly from **Binance**, **Coinbase**, or any exchange.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <div className="text-quantum-gold font-bold mb-1 uppercase text-[10px]">Step 1</div>
                                            <div className="text-xs">Select "Withdraw" on your exchange.</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <div className="text-quantum-gold font-bold mb-1 uppercase text-[10px]">Step 2</div>
                                            <div className="text-xs">Send funds to the address provided on your invoice.</div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] bg-yellow-500/10 p-2 rounded border border-yellow-500/30 text-yellow-500">
                                        💡 No wallet connection required. Funds are credited automatically after blockchain confirmation.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-quantum-gold">security</span>
                                    Security Protocol
                                </h3>
                                <ul className="space-y-3 text-sm text-white/60">
                                    <li className="flex items-start gap-2">
                                        <span className="text-quantum-gold">✦</span>
                                        Assets are stored in ultra-secure cold storage nodes.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-quantum-gold">✦</span>
                                        Transactions are verified via encrypted IPN callbacks.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-quantum-gold">✦</span>
                                        Minimum deposit is {serverMode === 'TEST' ? '0.000001' : '10'} USDT for security clearing.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Deposit Form Area */}
                        <div className="bg-black/60 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-quantum-gold/5 transition-opacity group-hover:opacity-100 opacity-0 pointer-events-none"></div>

                            <div className="mb-8">
                                <label className="block text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
                                    1. Select Asset & Network
                                </label>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={() => { setCurrency('USDT'); setChain('TRC20'); }}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currency === 'USDT' ? 'border-quantum-gold bg-quantum-gold/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="text-xl font-black text-white">USDT</div>
                                        <div className="text-[10px] text-white/40">TRON Network</div>
                                    </button>
                                    <button
                                        onClick={() => { setCurrency('TRX'); setChain('TRC20'); }}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currency === 'TRX' ? 'border-quantum-gold bg-quantum-gold/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="text-xl font-black text-white">TRX</div>
                                        <div className="text-[10px] text-white/40">TRON Network</div>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => { setCurrency('BTC'); setChain('BTC'); }}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currency === 'BTC' ? 'border-quantum-gold bg-quantum-gold/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="text-xl font-black text-white">BTC</div>
                                        <div className="text-[10px] text-white/40">Bitcoin Network</div>
                                    </button>
                                    <button
                                        onClick={() => { setCurrency('ETH'); setChain('ERC20'); }}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currency === 'ETH' ? 'border-quantum-gold bg-quantum-gold/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="text-xl font-black text-white">ETH</div>
                                        <div className="text-[10px] text-white/40">Ethereum Network</div>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
                                    2. Amount (USDT Value)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-quantum-gold font-black text-2xl">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white text-3xl font-black focus:outline-none focus:border-quantum-gold transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {[20, 50, 100, 500].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs font-bold transition-all"
                                        >
                                            +${val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleCreateDeposit}
                                disabled={isLoading || amount < (serverMode === 'TEST' ? 0.000001 : 10)}
                                className="w-full py-6 bg-gradient-to-r from-yellow-400 to-quantum-gold text-black font-black text-xl uppercase rounded-2xl shadow-gold-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Initializing...
                                    </div>
                                ) : 'Generate Payment Invoice'}
                            </button>
                        </div>
                    </>
                ) : (
                    /* Deposit Info Display */
                    <div className="lg:col-span-2 max-w-2xl mx-auto w-full">
                        <div className="bg-black/60 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-gold to-transparent animate-scanline"></div>

                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                                Send <span className="text-quantum-gold">{depositInfo.payAmount} {depositInfo.payCurrency}</span>
                            </h3>

                            {/* QR Code */}
                            <div className="bg-white rounded-3xl p-6 inline-block mb-8 shadow-gold-glow/20">
                                <img
                                    src={depositInfo.qrCodeUrl}
                                    alt="Deposit QR Code"
                                    className="w-48 h-48 md:w-64 md:h-64"
                                />
                            </div>

                            {/* Address Copy */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                                <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-3 text-center">Destination Address ({chain})</p>
                                <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-4 border border-white/5">
                                    <p className="flex-1 text-white font-mono text-xs md:text-sm break-all">
                                        {depositInfo.payAddress}
                                    </p>
                                    <button
                                        onClick={copyAddress}
                                        className="p-3 bg-quantum-gold/10 hover:bg-quantum-gold/20 rounded-xl transition-all text-quantum-gold"
                                    >
                                        <span className="material-symbols-outlined">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDepositInfo(null)}
                                    className="py-4 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all uppercase text-xs"
                                >
                                    Cancel Request
                                </button>

                                {serverMode === 'TEST' ? (
                                    <button
                                        onClick={handleSimulatePayment}
                                        className="py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all uppercase text-xs animate-pulse"
                                    >
                                        Simulate Confirmation (TEST ONLY)
                                    </button>
                                ) : (
                                    <div className="py-4 bg-white/5 border border-white/10 text-quantum-gold font-bold rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                        <div className="w-2 h-2 bg-quantum-gold rounded-full animate-ping"></div>
                                        Awaiting Multi-Sig Confirmation...
                                    </div>
                                )}
                            </div>

                            {serverMode !== 'TEST' && (
                                <p className="mt-4 text-[10px] text-white/40 italic">
                                    Funds will be credited automatically once the transaction is detected on-chain.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deposit;

