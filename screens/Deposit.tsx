import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

enum DepositStatus {
    IDLE = 'IDLE',
    CREATING = 'CREATING',
    AWAITING = 'AWAITING',
    VERIFYING = 'VERIFYING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED'
}

const Deposit: React.FC = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const [amount, setAmount] = useState<number>(20);
    const [currency, setCurrency] = useState<string>('USDT');
    const [chain, setChain] = useState<string>('TRC20');
    const [depositInfo, setDepositInfo] = useState<DepositResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<DepositStatus>(DepositStatus.IDLE);
    const [serverMode, setServerMode] = useState<'TEST' | 'PRODUCTION' | null>(null);

    // Watch for deposit confirmation via Supabase Realtime
    useEffect(() => {
        if (!depositInfo || !context?.user?.id) return;

        console.log("Subscribing to deposit confirmation for:", depositInfo.invoiceId);

        const channel = supabase
            .channel(`deposit_${depositInfo.invoiceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'deposits',
                    filter: `order_id=eq.${depositInfo.invoiceId}`
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    console.log("Deposit status update received:", newStatus);

                    if (newStatus === 'finished' || newStatus === 'confirmed') {
                        setStatus(DepositStatus.CONFIRMED);
                        sounds.playWin();
                    } else if (newStatus === 'failed' || newStatus === 'expired') {
                        setStatus(DepositStatus.FAILED);
                        setError(`Deposit ${newStatus}. Sequence aborted.`);
                    } else if (newStatus === 'confirming' || newStatus === 'partially_paid') {
                        setStatus(DepositStatus.VERIFYING);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [depositInfo, context?.user?.id]);

    const handleCreateDeposit = async () => {
        if (!context || !context.user || !context.isConnected) {
            navigate('/');
            return;
        }

        if (status === DepositStatus.CREATING) return;

        setStatus(DepositStatus.CREATING);
        setError(null);
        sounds.playClick();

        try {
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
            setStatus(DepositStatus.AWAITING);

        } catch (err: any) {
            console.error("Deposit Initiation Error:", err);
            setStatus(DepositStatus.FAILED);

            if (err.message && err.message.includes('CONFIG_ERROR')) {
                setError(err.message.replace('CONFIG_ERROR: ', ''));
            } else {
                setError(err.message || 'System failed to generate gateway.');
            }
        }
    };

    const copyAddress = () => {
        if (depositInfo) {
            navigator.clipboard.writeText(depositInfo.payAddress);
            alert('Address copied to clipboard!');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 pb-40 md:p-10 w-full relative">
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

            <div className="max-w-4xl mx-auto w-full">
                {status === DepositStatus.IDLE || status === DepositStatus.CREATING || (status === DepositStatus.FAILED && !depositInfo) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Information Card */}
                        <div className="space-y-6">
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-quantum-gold">info</span>
                                    Unified Gateway
                                </h3>
                                <p className="text-sm text-white/70 mb-4">Direct deposits from **Binance**, **Metamask**, or any exchange are supported.</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <span className="w-6 h-6 rounded-full bg-quantum-gold text-black flex items-center justify-center text-[10px] font-black">1</span>
                                        <span className="text-xs text-white/80">Generate your unique deposit address</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <span className="w-6 h-6 rounded-full bg-quantum-gold text-black flex items-center justify-center text-[10px] font-black">2</span>
                                        <span className="text-xs text-white/80">Send exact amount to clear security</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <span className="w-6 h-6 rounded-full bg-quantum-gold text-black flex items-center justify-center text-[10px] font-black">3</span>
                                        <span className="text-xs text-white/80">Funds credited after node confirmation</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-black/60 border border-white/10 rounded-3xl p-8">
                            <div className="mb-8">
                                <label className="block text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-4">Select Asset</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['USDT', 'TRX', 'BTC', 'ETH'].map(asset => (
                                        <button
                                            key={asset}
                                            onClick={() => setCurrency(asset)}
                                            className={`py-4 rounded-xl border-2 transition-all font-black ${currency === asset ? 'border-quantum-gold bg-quantum-gold/10 text-white' : 'border-white/5 bg-white/5 text-white/40'}`}
                                        >
                                            {asset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-4">Deposit Amount (USDT)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-quantum-gold font-black text-2xl">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white text-3xl font-black focus:outline-none focus:border-quantum-gold transition-all"
                                    />
                                </div>
                            </div>

                            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold">{error}</div>}

                            <button
                                onClick={handleCreateDeposit}
                                disabled={status === DepositStatus.CREATING || (context?.isConnected && amount < (serverMode === 'TEST' ? 0.000001 : 10))}
                                className={`w-full py-6 font-black text-xl uppercase rounded-2xl transition-all ${!context?.isConnected
                                        ? 'bg-neon-blue text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:bg-white'
                                        : 'bg-gradient-to-r from-yellow-400 to-quantum-gold text-black shadow-gold-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50'
                                    }`}
                            >
                                {status === DepositStatus.CREATING ? 'Initializing...' : !context?.isConnected ? 'Connect Wallet' : 'Generate Gateway'}
                            </button>
                        </div>
                    </div>
                ) : status === DepositStatus.CONFIRMED ? (
                    <div className="max-w-md mx-auto py-12 text-center bg-black/60 border border-green-500/20 rounded-3xl p-10 animate-fade-in shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                            <span className="material-symbols-outlined text-black text-5xl font-black">check</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Deposit Confirmed</h2>
                        <p className="text-white/60 mb-8 font-mono text-sm">Credits of {amount} {currency} have been secured and added to your balance.</p>
                        <button
                            onClick={() => window.location.href = '/lobby'}
                            className="w-full py-5 bg-green-500 text-black font-black uppercase rounded-2xl hover:bg-green-400 transition-all shadow-lg"
                        >
                            Enter Casino Lobby
                        </button>
                    </div>
                ) : (
                    /* Payment View (Awaiting / Verifying) */
                    <div className="max-w-2xl mx-auto w-full bg-black/60 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-gold to-transparent animate-scanline"></div>

                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className={`w-3 h-3 rounded-full ${status === DepositStatus.VERIFYING ? 'bg-blue-500 animate-pulse' : 'bg-quantum-gold animate-ping'}`}></div>
                            <span className="text-white/70 text-sm font-mono uppercase tracking-widest font-black">
                                {status === DepositStatus.VERIFYING ? 'Network Verification in Progress' : 'Waiting for Blockchain Transfer'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                            Send <span className="text-quantum-gold">{depositInfo?.payAmount} {depositInfo?.payCurrency}</span>
                        </h3>

                        <div className="bg-white rounded-3xl p-6 inline-block mb-8">
                            <img src={depositInfo?.qrCodeUrl} className="w-48 h-48 md:w-64 md:h-64" alt="QR" />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-3 text-center">Inbound Address</p>
                            <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-4 border border-white/5">
                                <p className="flex-1 text-white font-mono text-xs md:text-sm break-all font-black">{depositInfo?.payAddress}</p>
                                <button onClick={copyAddress} className="p-3 bg-quantum-gold text-black rounded-xl hover:bg-yellow-400 transition-all">
                                    <span className="material-symbols-outlined font-black">content_copy</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-white/40 italic uppercase tracking-widest">
                                ⛓️ Node Confirmation Required. Do not leave this terminal. ⛓️
                            </p>

                            {status === DepositStatus.FAILED && (
                                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setDepositInfo(null); setStatus(DepositStatus.IDLE); }}
                                    className="flex-1 py-4 bg-white/5 text-white/50 font-bold rounded-xl hover:bg-white/10 transition-all uppercase text-xs"
                                >
                                    Abort Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deposit;

