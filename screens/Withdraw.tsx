import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import {
  validateAddress,
  validateAmount,
  submitWithdrawalRequest,
  getWithdrawalLimits,
  getWithdrawalHistory,
  requestWithdrawalNonce,
  generateWithdrawalMessage,
  WITHDRAWAL_CONSTANTS,
  WithdrawalLimits,
  WithdrawalStatus
} from '../services/withdrawalService';
import { signMessage, WalletType } from '../services/walletService';

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [amount, setAmount] = useState<number>(0);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'tron' | 'bsc'>('tron');
  const [selectedToken, setSelectedToken] = useState<string>('USDT');
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [history, setHistory] = useState<WithdrawalStatus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);

  useEffect(() => {
    if (!context || !context.isConnected) {
      navigate('/');
      return;
    }

    // Detect wallet type
    const storedWalletType = localStorage.getItem('wallet_type') as WalletType;
    setWalletType(storedWalletType);

    // Load withdrawal limits and history
    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [context, navigate]);

  const loadData = async () => {
    // TODO: Replace with actual API calls
    // For now, use mock data that respects the constants
    setLimits({
      minAmount: WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL,
      maxAmount: WITHDRAWAL_CONSTANTS.MAX_WITHDRAWAL,
      dailyLimit: WITHDRAWAL_CONSTANTS.DAILY_LIMIT,
      dailyUsed: 0,
      dailyRemaining: WITHDRAWAL_CONSTANTS.DAILY_LIMIT,
      velocityLimit: WITHDRAWAL_CONSTANTS.VELOCITY_LIMIT,
      velocityUsed: 0,
      cooldownMinutes: WITHDRAWAL_CONSTANTS.COOLDOWN_MINUTES,
      token: selectedToken
    });

    // Mock history
    setHistory([]);
  };

  const handleQuickAmount = (value: number) => {
    if (limits) {
      const maxAllowed = Math.min(value, limits.dailyRemaining, context?.user.balance || 0, limits.maxAmount);
      setAmount(maxAllowed);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!context || !limits) return;

    // Validate address
    if (!validateAddress(destinationAddress, selectedChain)) {
      setError(`Invalid ${selectedChain} address format`);
      return;
    }

    // Validate amount
    const amountValidation = validateAmount(amount, context.user.balance, limits);
    if (!amountValidation.valid) {
      setError(amountValidation.error || 'Invalid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Request nonce from backend
      const nonceData = await requestWithdrawalNonce();
      if (!nonceData) {
        setError('Failed to get authentication nonce. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 3. SECURITY: Prove Ownership (EIP-191 / TRC-1271 style)
      const timestamp = Date.now();
      const message = generateWithdrawalMessage(
        destinationAddress,
        amount,
        selectedToken,
        selectedChain,
        nonceData.nonce,
        timestamp
      );

      // Attempt actual wallet signing if available
      let signature = 'DEMO_MODE_SIG';
      const walletTypeStored = (localStorage.getItem('wallet_type') as WalletType) || context.user.walletType;
      const walletAddress = localStorage.getItem('wallet_address') || context.user.address;

      if (walletTypeStored && walletAddress && !walletAddress.startsWith('0xGUEST')) {
        try {
          const sig = await signMessage(walletTypeStored, walletAddress, message);
          if (sig) signature = sig;
        } catch (signErr) {
          console.error("Signing failed, continuing with demo sig if guest:", signErr);
          if (!walletAddress.startsWith('0xGUEST')) throw new Error("Signature required for live withdrawals.");
        }
      }

      // 4. Submit to Backend Queue (The "Kill Switch" Architecture)
      const result = await submitWithdrawalRequest(
        {
          address: walletAddress,
          amount,
          token: selectedToken,
          chain: selectedChain,
          destinationAddress
        },
        signature,
        nonceData.nonce
      );

      if (result.success) {
        setSuccess(true);
        // Atomic ledger update simulation (backend would do this for real)
        context.setUser(prev => ({ ...prev, balance: prev.balance - amount }));

        // Clear inputs
        setAmount(0);
        setDestinationAddress('');

        setTimeout(() => setSuccess(null), 8000);
      } else {
        setError(result.error || 'Withdrawal rejected by quantum firewall.');
      }

    } catch (err: any) {
      setError(err.message || 'Quantum link error. Sequence aborted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRemaining = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Processing...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!context || !limits) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-gold"></div>
      </div>
    );
  }

  const quickAmounts = [
    limits.minAmount,
    Math.min(limits.maxAmount * 0.5, limits.dailyRemaining * 0.5),
    limits.maxAmount
  ].filter((v, i, arr) => arr.indexOf(v) === i && v > 0);

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 w-full relative">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Withdraw Funds</h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 transition-all"
          >
            Back to Profile
          </button>
        </div>
        <p className="text-white/60 text-sm">Request withdrawal to your wallet. All withdrawals are securely processed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/60 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs uppercase tracking-widest">Real Balance</span>
                <span className="material-symbols-outlined text-green-400 text-sm">verified</span>
              </div>
              <div className="text-3xl font-black text-white">
                ${context.user.real_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-white/40 text-[10px] uppercase mt-2">Always Withdrawable</div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-6 relative overflow-hidden">
              {(context.user.bonus_balance > 0 && (context.user.bonus_winnings || 0) < 50) && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                  <div className="text-center group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-bold text-quantum-gold uppercase tracking-tighter bg-black/80 px-2 py-1 rounded">Locked (Need $50 Earnings)</span>
                    <div className="text-[8px] text-white/50 mt-1">Current: ${(context.user.bonus_winnings || 0).toFixed(2)}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs uppercase tracking-widest">Bonus Balance</span>
                <span className={`material-symbols-outlined ${(context.user.bonus_winnings || 0) >= 50 ? 'text-green-400' : 'text-white/30'} text-sm`}>
                  {(context.user.bonus_winnings || 0) >= 50 ? 'lock_open' : 'lock'}
                </span>
              </div>
              <div className={`text-3xl font-black ${(context.user.bonus_winnings || 0) >= 50 ? 'text-quantum-gold' : 'text-white/30'}`}>
                ${context.user.bonus_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-white/40 text-[10px] uppercase mt-2">Withdrawable if Earnings ≥ $50</div>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm uppercase tracking-widest">Withdrawal Limit Remaining</span>
              <span className="material-symbols-outlined text-white/30">account_balance_wallet</span>
            </div>
            <div className="text-white/50 text-sm">
              {limits.dailyRemaining > 0 ? (
                <>
                  Daily limit remaining: <span className="text-white font-bold">${limits.dailyRemaining.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-red-400">Daily withdrawal limit reached</span>
              )}
            </div>
          </div>

          {/* Withdrawal Limits Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-400">info</span>
              <div className="flex-1 text-sm text-white/80">
                <p className="font-bold text-blue-400 mb-1">Withdrawal Limits</p>
                <ul className="space-y-1 text-white/70">
                  <li>Min: ${limits.minAmount} {selectedToken}</li>
                  <li>Max per request: ${limits.maxAmount} {selectedToken}</li>
                  <li>Daily limit: ${limits.dailyLimit} {selectedToken}</li>
                  <li>Max requests per day: {limits.velocityLimit}</li>
                  <li>Cooldown: {limits.cooldownMinutes} minutes between requests</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit} className="bg-black/60 border border-white/10 rounded-xl p-6 space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                Amount ({selectedToken})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl font-bold">$</span>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setAmount(val);
                    setError(null);
                  }}
                  min={limits.minAmount}
                  max={Math.min(limits.maxAmount, limits.dailyRemaining, context.user.balance)}
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 pl-8 py-4 text-white text-2xl font-bold focus:outline-none focus:border-quantum-gold transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              {quickAmounts.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {quickAmounts.map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold hover:bg-white/10 transition-all"
                    >
                      ${val.toFixed(2)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(Math.min(limits.maxAmount, limits.dailyRemaining, context.user.balance))}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Max
                  </button>
                </div>
              )}
            </div>

            {/* Chain Selection */}
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                Blockchain Network
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-quantum-gold transition-all"
              >
                <option value="tron">TRON (TRC20)</option>
                <option value="ethereum">Ethereum (ERC20)</option>
                <option value="bsc">BSC (BEP20)</option>
              </select>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2 uppercase tracking-widest">
                Destination Wallet Address
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => {
                  setDestinationAddress(e.target.value.trim());
                  setError(null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-quantum-gold transition-all"
                placeholder={selectedChain === 'tron' ? 'T...' : '0x...'}
                required
              />
              <p className="text-white/50 text-xs mt-2">
                Double-check the address. Transactions cannot be reversed.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400">error</span>
                <p className="text-red-400 text-sm font-bold">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <p className="text-green-400 text-sm font-bold">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                amount <= 0 ||
                !destinationAddress ||
                amount > (context.user.real_balance + ((context.user.bonus_winnings || 0) >= 50 ? context.user.bonus_balance : 0)) ||
                amount > limits.maxAmount ||
                amount > limits.dailyRemaining ||
                limits.velocityUsed >= limits.velocityLimit
              }
              className="w-full py-4 bg-gradient-to-r from-quantum-gold to-yellow-600 text-black font-black text-lg uppercase rounded-xl hover:shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Processing...
                </span>
              ) : (
                'Request Withdrawal'
              )}
            </button>

            {/* Security Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Security Notice</p>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Withdrawals are queued and processed securely</li>
                <li>• Small withdrawals may be auto-approved after a delay</li>
                <li>• Large withdrawals require manual approval</li>
                <li>• All withdrawals are processed by our secure wallet service</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="space-y-6">
          <div className="bg-black/60 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-quantum-gold">history</span>
              Withdrawal History
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8 text-white/50 text-sm">
                <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                <p>No withdrawal history</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {history.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-white font-bold">${withdrawal.amount.toFixed(2)} {withdrawal.token}</div>
                        <div className="text-white/50 text-xs font-mono mt-1">
                          {withdrawal.destinationAddress.slice(0, 8)}...{withdrawal.destinationAddress.slice(-6)}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        withdrawal.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                          withdrawal.status === 'pending_manual' ? 'bg-orange-500/20 text-orange-400' :
                            withdrawal.status === 'pending_auto' ? 'bg-blue-500/20 text-blue-400' :
                              withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                withdrawal.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-400'
                        }`}>
                        {withdrawal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-white/50 text-xs mt-2">
                      {withdrawal.autoApproveAt && withdrawal.status === 'pending_auto' && (
                        <div>Auto-approval in: {formatTimeRemaining(withdrawal.autoApproveAt)}</div>
                      )}
                      <div>Requested: {withdrawal.requestedAt.toLocaleString()}</div>
                      {withdrawal.txHash && (
                        <div className="font-mono text-blue-400 mt-1 break-all">{withdrawal.txHash.slice(0, 20)}...</div>
                      )}
                      {withdrawal.rejectionReason && (
                        <div className="text-red-400 mt-1">Reason: {withdrawal.rejectionReason}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

