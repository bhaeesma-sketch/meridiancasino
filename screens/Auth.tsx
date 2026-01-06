import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../App';
import { detectWallet, connectWallet, getAvailableWallets, WalletType, WalletInfo } from '../services/walletService';
import { WalletImportModal } from '../components/WalletImportModal';
import { generateReferralCode, validateReferralCode, NEW_USER_BONUS } from '../services/referralService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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
    if (!context) return;

    // If no specific wallet passed, check if we need to select
    if (!preferredWallet) {
      if (detectedWallets.length > 1) {
        setShowWalletSelection(true);
        return;
      }
      if (detectedWallets.length === 1) {
        preferredWallet = detectedWallets[0];
      }
    }

    setIsConnecting(true);
    setError(null);
    setShowWalletSelection(false);

    try {
      // If no wallet detected, show error
      if (!preferredWallet && !availableWallet) {
        setError('No wallet detected. Please install MetaMask or TronLink.');
        setIsConnecting(false);
        return;
      }

      const walletToConnect = preferredWallet || availableWallet;

      // Connect to wallet
      const walletInfo = await connectWallet(walletToConnect);

      if (!walletInfo || !walletInfo.address) {
        setError('Failed to connect wallet. Please try again.');
        setIsConnecting(false);
        return;
      }

      // In a real app, here you would:
      // 1. Request nonce from backend
      // 2. Sign message with wallet
      // 3. Send signature to backend for verification
      // 4. Backend returns JWT token

      // Supabase Integration: Check for existing user
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletInfo.address)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching profile:', fetchError);
        setError('Failed to fetch user profile. Please try again.');
        setIsConnecting(false);
        return;
      }

      let userProfile = existingProfile;
      const isNewUser = !existingProfile;

      if (isNewUser) {
        // Handle referral code if present
        const pendingRefCode = localStorage.getItem('pending_referral_code') || referralCode;
        let referredBy = null;
        if (pendingRefCode && validateReferralCode(pendingRefCode)) {
          referredBy = pendingRefCode.toUpperCase();
        }

        // Generate referral code for new user
        // Generate referral code for new user
        const safeAddress = String(walletInfo.address || '');
        if (!safeAddress) {
          throw new Error("Wallet address is invalid/empty");
        }

        const newUserRefCode = generateReferralCode(safeAddress.slice(0, 8));

        // Bonus amount: $25 if referred, $10 otherwise
        const bonusAmount = referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;

        const profileData = {
          wallet_address: safeAddress,
          username: `User_${safeAddress.slice(-4)}`,
          referral_code: newUserRefCode,
          referred_by: referredBy,
          balance: 0, // Start with 0, claim in lobby
          is_new_user: true,
          bonus_claimed: false
        };

        // Create new profile in Supabase
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          setError(`Failed to create user profile: ${insertError.message} (${insertError.details || ''})`);
          setIsConnecting(false);
          return;
        }
        userProfile = newProfile;
      }

      // Store in context and localStorage (as fallback/cache)
      localStorage.setItem('wallet_address', walletInfo.address);
      localStorage.setItem('wallet_type', walletInfo.walletType || '');

      // Update user context with data from Supabase
      context.setUser({
        address: userProfile.wallet_address,
        username: userProfile.username,
        balance: Number(userProfile.balance),
        referralCode: userProfile.referral_code,
        referredBy: userProfile.referred_by || undefined,
        isNewUser: userProfile.is_new_user,
        newUserBonusClaimed: userProfile.bonus_claimed,
        joinedDate: new Date(userProfile.joined_date).getTime()
      });

      // Set connected state
      context.setIsConnected(true);

      // Clear pending referral code
      localStorage.removeItem('pending_referral_code');

      // Navigate to lobby
      navigate('/lobby');

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(`Connection failed: ${err.message || JSON.stringify(err)}`);
      setIsConnecting(false);
    }
  };


  const walletName = availableWallet === 'metamask' ? 'MetaMask' :
    availableWallet === 'tronlink' ? 'TronLink' :
      'Wallet';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img
          alt="Quantum Space Nebula"
          className="h-full w-full object-cover opacity-90 scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMnLtXBjIcz_BsCgLdAhckHzmI1cx7YctVH-5aOKMzX9mgVrbeslCnfuCjZK0B0L0PSbT6l23a4jhzZBY-GlJxc0aHQAAHhMPseS3PP_MrRZEkcOijiv287UvfP8X0ApZBDSo-MRdWob-gcMuwejemR-i0tUcpv89W17Mf-f843Ov1qEHenrniNuh7pTRqS0X_QADU5QRtMAYajORhAVoL2tSBle_8qt1CW8dXoEcwPs-ts-FPvoLKvw2wqJVYiwmWLIHE4Z62dXk"
        />
      </div>

      {/* Animated Promotional Banner */}
      <div className="relative z-20 w-full max-w-2xl px-6 mb-8 animate-deep-fade-up">
        <div className="relative group">
          {/* Pulsing Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-quantum-gold via-yellow-400 to-quantum-gold rounded-3xl opacity-75 group-hover:opacity-100 blur-xl animate-pulse"></div>

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

          {/* Logo Icon Box */}
          <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-black/40 border border-quantum-gold/40 shadow-gold-glow-sm">
            <span className="material-symbols-outlined text-quantum-gold text-4xl font-bold">casino</span>
          </div>

          {/* Branding Section */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <h2 className="font-heading font-black text-lg text-quantum-gold tracking-[0.3em] uppercase leading-none">
              Meridian
            </h2>
            <h1 className="font-heading font-black text-5xl text-white tracking-tighter uppercase leading-none">
              Casino<span className="text-quantum-gold">Clash</span>
            </h1>
          </div>

          <p className="text-white/40 text-[11px] mb-8 tracking-[0.25em] uppercase font-bold">
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
            <button
              onClick={() => handleConnect()}
              disabled={!availableWallet || isConnecting}
              className="group relative w-full h-16 bg-gradient-to-r from-yellow-400 via-quantum-gold to-yellow-600 rounded-2xl flex items-center justify-center gap-3 text-black font-black text-lg uppercase shadow-gold-glow hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting && availableWallet ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl font-bold group-hover:rotate-12 transition-transform">account_balance_wallet</span>
                  <span>Connect {walletName}</span>
                </>
              )}
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Import Wallet Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white font-bold uppercase hover:bg-white/10 hover:border-quantum-gold/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">vpn_key</span>
              <span>Import Wallet</span>
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
              balance: Number(userProfile.balance),
              referralCode: userProfile.referral_code,
              referredBy: userProfile.referred_by || undefined,
              isNewUser: userProfile.is_new_user,
              newUserBonusClaimed: userProfile.bonus_claimed,
              joinedDate: new Date(userProfile.joined_date).getTime()
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
