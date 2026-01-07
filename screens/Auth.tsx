import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../App';
import { detectWallet, connectWallet, getAvailableWallets, WalletType, WalletInfo } from '../services/walletService';
import { WalletImportModal } from '../components/WalletImportModal';
import { generateReferralCode, validateReferralCode, NEW_USER_BONUS } from '../services/referralService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { MeridianButton } from '../components/MeridianButton';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [availableWallet, setAvailableWallet] = useState<WalletType>(null);
  const [detectedWallets, setDetectedWallets] = useState<WalletType[]>([]);
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');

  // Get referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref') || searchParams.get('referral');
    if (refCode && validateReferralCode(refCode)) {
      setReferralCode(refCode.toUpperCase());
      // Store in localStorage for later use
      localStorage.setItem('pending_referral_code', refCode.toUpperCase());
    }
  }, [searchParams]);

  // Detect available wallets on mount
  useEffect(() => {
    const checkWallet = () => {
      const wallets = getAvailableWallets();
      setDetectedWallets(wallets);
      setAvailableWallet(wallets.length > 0 ? wallets[0] : null);
    };

    checkWallet();

    // Check again after a second in case injection was slow
    const timer = setTimeout(checkWallet, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async (preferredWallet?: WalletType) => {
    // ... existing code ...
  };

  const handleQuickPlay = async () => {
    if (!context) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Generate a persistent guest wallet address if one doesn't exist
      let guestAddress = localStorage.getItem('guest_wallet_address');

      if (!guestAddress) {
        // Create a random eth-like address for the internal DB mapping
        const randomBytes = new Uint8Array(20);
        crypto.getRandomValues(randomBytes);
        guestAddress = '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('guest_wallet_address', guestAddress);
      }

      // Check for existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', guestAddress)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Failed to fetch guest profile');
      }

      let userProfile = existingProfile;

      if (!userProfile) {
        // Create new guest profile
        const newUserRefCode = generateReferralCode(guestAddress.slice(0, 8));
        const pendingRefCode = localStorage.getItem('pending_referral_code') || referralCode;

        const profileData = {
          wallet_address: guestAddress,
          username: `Guest_${guestAddress.slice(-4)}`,
          referral_code: newUserRefCode,
          referred_by: pendingRefCode || null,
          balance: 0,
          is_new_user: true,
          bonus_claimed: false
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (insertError) throw insertError;
        userProfile = newProfile;
      }

      // Set user in context
      context.setUser({
        address: userProfile.wallet_address,
        username: userProfile.username,
        balance: Number(userProfile.real_balance || userProfile.balance || 0),
        real_balance: Number(userProfile.real_balance || 0),
        bonus_balance: Number(userProfile.bonus_balance || 0),
        valid_referral_count: userProfile.valid_referral_count || 0,
        is_first_deposit: userProfile.is_first_deposit || false,
        referralCode: userProfile.referral_code,
        referredBy: userProfile.referred_by || undefined,
        isAdmin: userProfile.is_admin
      });

      context.setIsConnected(true);
      navigate('/lobby');

    } catch (err: any) {
      console.error('Quick Play error:', err);
      setError(`Quick Play failed: ${err.message}`);
      setIsConnecting(false);
    }
  };


  const walletName = availableWallet === 'metamask' ? 'MetaMask' :
    availableWallet === 'tronlink' ? 'TronLink' :
      'Wallet';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-meridian-navy">
      {/* Epic Fantasy Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-fire-bright/10 via-meridian-midnight to-ice-electric/10"></div>
        <div className="absolute inset-0 opacity-20 bg-mesh"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fire-bright/15 rounded-full blur-[150px] animate-dragon-breath"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ice-electric/15 rounded-full blur-[150px] animate-dragon-breath" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-mystical-magenta/10 rounded-full blur-[200px] animate-mystical-pulse"></div>
      </div>

      {/* Epic Promotional Banner */}
      <div className="relative z-20 w-full max-w-2xl px-6 mb-8 animate-deep-fade-up">
        <div className="relative group">
          {/* Mystical Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold-primary via-mystical-magenta to-ice-electric rounded-3xl opacity-75 group-hover:opacity-100 blur-xl animate-mystical-pulse"></div>

          {/* Banner Container */}
          <div className="relative bg-black/60 backdrop-blur-xl border-2 border-quantum-gold/30 rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(255,215,0,0.3)] animate-float">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Content */}
            <div className="relative p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
              <div className="flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-quantum-gold text-3xl animate-bounce">redeem</span>
                  <h3 className="font-heading font-black text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-quantum-gold via-yellow-200 to-quantum-gold">
                    GET $10 FREE
                  </h3>
                </div>
                <p className="text-white/80 text-sm font-bold mb-1">New Player Bonus</p>
                <p className="text-white/60 text-xs">
                  Sign up now and start playing instantly!
                </p>
              </div>

              {/* Bonus Badge */}
              <div className="relative">
                <div className="bg-gradient-to-br from-quantum-gold to-yellow-600 text-black font-black px-6 py-3 rounded-xl shadow-gold-glow transform hover:scale-105 transition-transform">
                  <div className="text-xs uppercase tracking-widest">Instant Bonus</div>
                  <div className="text-2xl">$10</div>
                </div>
                {referralCode && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                    +$15 MORE!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Auth Terminal Container */}
      <div className="relative z-30 w-full max-w-md px-6 flex flex-col items-center animate-holo-entry">
        <div className="w-full bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-10 flex flex-col items-center text-center">

          {/* Animated Logo */}
          <div className="mb-8 scale-110">
            <AnimatedLogo />
          </div>

          <p className="text-quantum-gold text-[11px] mb-8 tracking-[0.4em] uppercase font-black italic">
            Quantum Legacy Ecosystem
          </p>

          {/* Enhanced Referral Code Display (if present) */}
          {referralCode && (
            <div className="w-full mb-4 relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-quantum-gold to-green-400 rounded-xl opacity-60 group-hover:opacity-100 blur animate-pulse"></div>

              <div className="relative p-4 bg-gradient-to-br from-quantum-gold/20 via-green-500/10 to-quantum-gold/20 border-2 border-quantum-gold/40 rounded-xl backdrop-blur-sm">
                {/* Bonus Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +150% BONUS
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-quantum-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-quantum-gold text-2xl">card_giftcard</span>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] text-quantum-gold/80 uppercase tracking-widest mb-1 font-bold">Referral Code Detected!</p>
                    <p className="text-quantum-gold font-mono font-black text-lg mb-2">{referralCode}</p>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-quantum-gold/50 to-transparent"></div>
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">Your Bonus</span>
                      <div className="flex-1 h-px bg-gradient-to-l from-quantum-gold/50 to-transparent"></div>
                    </div>

                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 mb-2">
                      <div className="text-center flex-1">
                        <div className="text-white/40 text-[9px] uppercase mb-0.5">Without Ref</div>
                        <div className="text-white/60 font-bold line-through">$10</div>
                      </div>
                      <div className="material-symbols-outlined text-quantum-gold">arrow_forward</div>
                      <div className="text-center flex-1">
                        <div className="text-quantum-gold text-[9px] uppercase mb-0.5">With Referral</div>
                        <div className="text-quantum-gold font-black text-xl">$25</div>
                      </div>
                    </div>

                    <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      You'll receive $25 welcome bonus!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Detection Status */}
          {availableWallet ? (
            <div className="w-full mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-[10px] text-green-400 uppercase tracking-widest mb-1">Wallet Detected</p>
              <p className="text-green-400 font-bold">{walletName}</p>
            </div>
          ) : (
            <div className="w-full mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-[10px] text-yellow-400 uppercase tracking-widest mb-1">No Wallet Found</p>
              <p className="text-yellow-400 text-xs">Please install MetaMask or TronLink</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            <MeridianButton
              onClick={() => handleConnect()}
              disabled={!availableWallet || isConnecting}
              variant="primary"
              size="lg"
              loading={isConnecting && !!availableWallet}
              icon={!isConnecting ? <span className="material-symbols-outlined text-3xl">account_balance_wallet</span> : undefined}
              className="w-full h-16 text-lg uppercase"
            >
              {isConnecting && availableWallet ? 'Connecting...' : `Connect ${walletName}`}
            </MeridianButton>

            {/* Quick Play Button */}
            <MeridianButton
              onClick={() => handleQuickPlay()}
              disabled={isConnecting}
              variant="secondary"
              size="lg"
              icon={<span className="material-symbols-outlined text-2xl">bolt</span>}
              className="w-full h-16 text-lg uppercase"
            >
              Quick Play (Guest)
            </MeridianButton>

            {/* Import Wallet Button */}
            <button
              onClick={() => setShowImportModal(true)}
              disabled={isConnecting}
              className="w-full py-4 bg-transparent border border-white/10 rounded-xl text-white/60 font-bold uppercase hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-sm">vpn_key</span>
              <span>Import Private Key</span>
            </button>

          </div>

          {/* Refer & Earn Info Section */}
          <div className="w-full mt-6 p-4 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-cyan-400 text-xl">groups</span>
              <h4 className="font-heading font-black text-sm text-white uppercase">Refer & Earn Program</h4>
            </div>

            <div className="space-y-3">
              {/* How it Works */}
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 text-xs font-black">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-xs font-bold mb-0.5">Share Your Code</p>
                  <p className="text-white/50 text-[10px]">Invite friends to join with your referral code</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-black">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-xs font-bold mb-0.5">They Get Bonus</p>
                  <p className="text-white/50 text-[10px]">Friends get $25 welcome bonus (vs $10 without referral)</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-quantum-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-quantum-gold text-xs font-black">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-xs font-bold mb-0.5">You Earn Commission</p>
                  <p className="text-white/50 text-[10px]">Earn 5%-25% commission on their wagering (tier-based)</p>
                </div>
              </div>

              {/* Commission Tiers Preview */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Commission Tiers</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/20 rounded-lg p-2">
                    <p className="text-[8px] text-white/40 uppercase mb-1">Bronze-Gold</p>
                    <p className="text-white font-black text-xs">5-10%</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2">
                    <p className="text-[8px] text-white/40 uppercase mb-1">Platinum</p>
                    <p className="text-purple-400 font-black text-xs">12-15%</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2 border border-quantum-gold/30">
                    <p className="text-[8px] text-quantum-gold uppercase mb-1">Diamond+</p>
                    <p className="text-quantum-gold font-black text-xs">20-25%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-white/40 text-[9px] mt-6 text-center">
            By connecting, you agree to our Terms of Service
            <br />
            Wallet connection is secure and encrypted
          </p>
        </div>

        {/* Subtle Bottom Accent */}
        <div className="mt-8 flex items-center gap-2 opacity-30 grayscale pointer-events-none">
          <div className="h-px w-8 bg-white/20"></div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">System Secure</span>
          <div className="h-px w-8 bg-white/20"></div>
        </div>
      </div>

      {/* Wallet Selection Modal */}
      {showWalletSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-space-black border border-quantum-gold/30 rounded-2xl shadow-gold-glow overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold text-white mb-6 text-center uppercase tracking-wider">
                Select Wallet
              </h3>

              <div className="space-y-3">
                {/* MetaMask Option */}
                {detectedWallets.includes('metamask') && (
                  <button
                    onClick={() => handleConnect('metamask')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-quantum-gold/50 transition-all group"
                  >
                    <div className="size-10 rounded-full bg-[#F6851B]/10 flex items-center justify-center border border-[#F6851B]/20 group-hover:bg-[#F6851B]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#F6851B] text-2xl">account_balance_wallet</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-white text-lg">MetaMask</div>
                      <div className="text-xs text-white/50">Ethereum / BNB Chain</div>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-quantum-gold transition-colors">arrow_forward_ios</span>
                  </button>
                )}

                {/* TronLink Option */}
                {detectedWallets.includes('tronlink') && (
                  <button
                    onClick={() => handleConnect('tronlink')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-quantum-gold/50 transition-all group"
                  >
                    <div className="size-10 rounded-full bg-[#EB0029]/10 flex items-center justify-center border border-[#EB0029]/20 group-hover:bg-[#EB0029]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#EB0029] text-2xl">bolt</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-white text-lg">TronLink</div>
                      <div className="text-xs text-white/50">TRON Network</div>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-quantum-gold transition-colors">arrow_forward_ios</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowWalletSelection(false)}
                className="mt-6 w-full py-3 text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold border-t border-white/5"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Import Modal */}
      <WalletImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={async (address) => {
          // Handle imported wallet
          if (!context) return;

          setIsConnecting(true);
          setShowImportModal(false);

          try {
            // Check if user exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('wallet_address', address.toLowerCase())
              .single();

            let userProfile = existingProfile;

            if (!userProfile) {
              // Create new profile
              const newProfile = {
                id: crypto.randomUUID(),
                wallet_address: address.toLowerCase(),
                username: `User_${address.slice(0, 6)}`,
                referral_code: generateReferralCode(`User_${address.slice(0, 6)}`),
                referred_by: referralCode || null,
                balance: 0,
                is_new_user: true,
                bonus_claimed: false
              };

              const { data, error } = await supabase
                .from('profiles')
                .insert([newProfile])
                .select()
                .single();

              if (error) throw error;
              userProfile = data;
            }

            // Set user in context
            context.setUser({
              address: address,
              balance: Number(userProfile.real_balance || userProfile.balance || 0),
              real_balance: Number(userProfile.real_balance || 0),
              bonus_balance: Number(userProfile.bonus_balance || 0),
              valid_referral_count: userProfile.valid_referral_count || 0,
              is_first_deposit: userProfile.is_first_deposit || false,
              referralCode: userProfile.referral_code,
              referredBy: userProfile.referred_by || undefined,
              isAdmin: userProfile.is_admin
            });

            context.setIsConnected(true);
            navigate('/lobby');
          } catch (err: any) {
            setError(err.message || 'Failed to import wallet');
          } finally {
            setIsConnecting(false);
          }
        }}
      />
    </div>
  );
};

export default Auth;
