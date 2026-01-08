import React, { useState } from 'react';
import { useSecurity } from '../contexts/SecurityContext'; // Corrected import
import { useNavigate } from 'react-router-dom';
import { connectWallet, createLocalWallet } from '../services/walletService'; // Corrected path and import
import { supabase, isSupabaseConfigured } from '../services/supabase';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useSecurity();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async (walletType: 'metamask' | 'tronlink') => {
    setLoading(true);
    setError(null);
    try {
      const result = await connectWallet(walletType);

      if (result && result.connected && result.address) {
        setWalletAddress(result.address);
        // Simulate security scan or just navigate
        navigate('/lobby');

        // Supabase integration
        if (isSupabaseConfigured) {
          const chainType = walletType === 'metamask' ? 'ethereum' : 'tron';
          // Fix: Use 'profiles' table instead of 'users'
          const { error: dbError } = await supabase.from('profiles').upsert({
            wallet_address: result.address,
            // chain_type: chainType, // active_chain might be the column name, check schema or omit if not needed
            last_seen: new Date().toISOString() // last_login might be different
          }, { onConflict: 'wallet_address' });

          if (dbError) console.error("Supabase Error:", dbError);
        }
      } else {
        setError(`${walletType === 'metamask' ? 'MetaMask' : 'TronLink'} connection failed or rejected.`);
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      // Use the context error handler if appropriate, or local state
      setError(err.message || "Failed to connect wallet");
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantPlay = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = createLocalWallet();

      if (result && result.connected && result.address) {
        setWalletAddress(result.address);
        navigate('/lobby');

        if (isSupabaseConfigured) {
          const { error: dbError } = await supabase.from('profiles').upsert({
            wallet_address: result.address,
            username: `User ${result.address.slice(0, 6)}`,
            last_seen: new Date().toISOString()
          }, { onConflict: 'wallet_address' });

          if (dbError) console.error("Supabase Error:", dbError);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-cyber-black text-white font-display overflow-hidden h-screen flex flex-col selection:bg-neon-pink selection:text-white">
      {/* Background Layers */}
      <div className="fixed inset-0 z-[-2] bg-cyber-city transform scale-105"></div>
      <div className="fixed inset-0 z-[-1] bg-grid pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 z-[-1] bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_50%,rgba(188,19,254,0.1),transparent_70%)] pointer-events-none"></div>
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none circuit-overlay"></div>
      <div className="fixed inset-0 pointer-events-none bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q1ZzZ2bnZ6Znh5ZHZsMmZsZmZsZmZsZmZsZmZsZmZsZmZs/L0qTl8k3g9m5/giphy.gif')] bg-cover mix-blend-screen opacity-10"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 lg:px-10 flex items-center justify-between border-b border-white/5 bg-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-black border border-neon-pink/50 rounded flex items-center justify-center text-neon-pink shadow-neon-pink clip-angled-sm">
            <span className="material-symbols-outlined text-2xl animate-pulse-neon">token</span>
          </div>
          <h1 className="text-white text-2xl lg:text-3xl font-heading font-black tracking-tighter uppercase glitch-text drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] italic transform -skew-x-6" data-text="CASINO CLASH">
            CASINO <span className="text-neon-blue">CLASH</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neon-blue/60 animate-pulse hidden sm:block">// SECURE_CONNECTION_ESTABLISHED</span>
          <div className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_#0aff00]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 w-full h-full">
        <div className="relative w-full max-w-md mx-auto animate-slide-up">
          {/* Decorative border glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-none opacity-50 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-neon clip-angled-lg"></div>

          <div className="relative bg-cyber-black/90 backdrop-blur-xl border border-neon-blue/30 p-8 clip-angled-lg shadow-login-glow flex flex-col items-center">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <span className="material-symbols-outlined text-neon-blue animate-spin text-4xl" style={{ animationDuration: '10s' }}>settings</span>
            </div>
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-neon-blue/50 rounded-tl-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-neon-pink/50 rounded-br-3xl opacity-50"></div>

            {/* Title */}
            <div className="text-center mb-10 w-full">
              <h2 className="text-3xl md:text-4xl font-montserrat font-extrabold text-white tracking-wider uppercase mb-2 glitch-text" data-text="ACCESS TERMINAL">
                ACCESS TERMINAL
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-neon-purple to-transparent mx-auto mb-4"></div>
              <p className="text-neon-blue/70 font-mono text-xs tracking-[0.2em] uppercase">Connect Wallet</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-6 relative z-20 w-full flex flex-col items-center">
              {loading && <p className="text-neon-yellow animate-pulse mb-2">INITIALIZING HANDSHAKE...</p>}
              {error && <p className="text-red-500 mb-2">{error}</p>}

              <button
                onClick={() => handleConnect('metamask')}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-transparent border border-neon-purple text-neon-purple hover:text-black font-heading font-bold text-base md:text-lg uppercase tracking-widest py-4 clip-angled transition-all duration-300 shadow-[0_0_15px_rgba(188,19,254,0.6)] hover:shadow-[0_0_40px_rgba(188,19,254,0.8)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full bg-neon-purple/0 group-hover:bg-neon-purple transition-all duration-300"></span>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"></path>
                  </svg>
                  Connect Metamask
                </span>
              </button>

              <button
                onClick={() => handleConnect('tronlink')}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-transparent border border-neon-green text-neon-green hover:text-black font-heading font-bold text-base md:text-lg uppercase tracking-widest py-4 clip-angled transition-all duration-300 shadow-[0_0_15px_rgba(10,255,0,0.6)] hover:shadow-[0_0_40px_rgba(10,255,0,0.8)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full bg-neon-green/0 group-hover:bg-neon-green transition-all duration-300"></span>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-3xl">wallet</span>
                  Connect TronLink
                </span>
              </button>


              <div className="relative flex py-2 items-center w-full">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button
                onClick={handleInstantPlay}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-transparent border border-quantum-gold text-quantum-gold hover:text-black font-heading font-bold text-base md:text-lg uppercase tracking-widest py-4 clip-angled transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full bg-quantum-gold/0 group-hover:bg-quantum-gold transition-all duration-300"></span>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-3xl">bolt</span>
                  Instant Play (No Wallet)
                </span>
              </button>
            </div>

            {/* Footer / Links */}
            <div className="mt-8 text-center">
              <p className="text-white/40 text-xs font-mono">
                New Entity?
                <a className="text-neon-yellow hover:text-white transition-colors ml-1 uppercase tracking-wider hover:shadow-[0_0_10px_rgba(255,234,0,0.5)] cursor-pointer" onClick={() => alert("Registration coming soon")}>
                  Register ID
                </a>
              </p>
            </div>
          </div>
        </div>
      </main >

      {/* Footer Stats */}
      < footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#050505] border-t border-gray-800 z-40 flex items-center overflow-hidden shadow-[0_-5px_20px_rgba(0,0,0,0.8)]" >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        <div className="w-full flex">
          <div className="flex animate-ticker whitespace-nowrap">
            <div className="flex items-center gap-12 px-4 text-[10px] font-mono text-white/40">
              <span>SYSTEM_STATUS: <span className="text-neon-green">OPTIMAL</span></span>
              <span>ENCRYPTION: <span className="text-neon-blue">AES-256</span></span>
              <span>SERVER_LOAD: <span className="text-neon-purple">34%</span></span>
              <span>ACTIVE_NODES: <span className="text-neon-orange">8,492</span></span>
              <span>LAST_BREACH_ATTEMPT: <span className="text-red-500">BLOCKED</span></span>
              {/* Duplicate for infinite scroll */}
              <span>SYSTEM_STATUS: <span className="text-neon-green">OPTIMAL</span></span>
              <span>ENCRYPTION: <span className="text-neon-blue">AES-256</span></span>
              <span>SERVER_LOAD: <span className="text-neon-purple">34%</span></span>
              <span>ACTIVE_NODES: <span className="text-neon-orange">8,492</span></span>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default Auth;
