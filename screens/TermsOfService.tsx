import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="text-sm font-bold uppercase">Back</span>
                </button>

                <h1 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-quantum-gold via-yellow-200 to-quantum-gold mb-2">
                    Terms of Service
                </h1>
                <p className="text-white/60 text-sm">
                    Last Updated: January 5, 2026
                </p>
            </div>

            <div className="space-y-6 text-white/80">
                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">
                        Welcome to Casino Clash: Quantum Legacy. By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">2. User Accounts</h2>
                    <p className="mb-4">
                        <strong className="text-white">2.1 Registration:</strong> You must connect a valid cryptocurrency wallet (MetaMask or TronLink) to access real-money gaming features.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">2.2 Age Requirement:</strong> You must be at least 18 years old (or the legal gambling age in your jurisdiction) to use Casino Clash.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">2.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your wallet and private keys. Casino Clash will never ask for your private keys.
                    </p>
                    <p>
                        <strong className="text-white">2.4 One Account:</strong> Each user is permitted only one account. Multiple accounts may result in suspension of all accounts.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">3. Bonuses and Promotions</h2>
                    <p className="mb-4">
                        <strong className="text-white">3.1 Welcome Bonus:</strong> New users receive a $10 welcome bonus without referral, or $25 with a valid referral code.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">3.2 Wagering Requirements:</strong> All bonuses are subject to a 1.5x wagering requirement before withdrawal.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">3.3 Referral Program:</strong> Users earn 5-25% commission on referred users' wagering, based on their tier level.
                    </p>
                    <p>
                        <strong className="text-white">3.4 Bonus Abuse:</strong> Bonus abuse, including creating multiple accounts, is strictly prohibited and will result in forfeiture of bonuses and account suspension.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">4. Game Rules and Fairness</h2>
                    <p className="mb-4">
                        <strong className="text-white">4.1 Provably Fair:</strong> All games use quantum-verified random number generation to ensure fairness.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">4.2 Game Outcomes:</strong> All game outcomes are final. Disputes must be reported within 24 hours.
                    </p>
                    <p>
                        <strong className="text-white">4.3 Prohibited Conduct:</strong> Use of bots, automation, or any form of cheating is strictly prohibited.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">5. Deposits and Withdrawals</h2>
                    <p className="mb-4">
                        <strong className="text-white">5.1 Cryptocurrency Only:</strong> Casino Clash accepts deposits in USDT (TRC20), TRX, and BTC.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">5.2 Minimum Amounts:</strong> Minimum deposit is $10 USDT equivalent. Minimum withdrawal is $20 USDT equivalent.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">5.3 Processing Time:</strong> Withdrawals are processed within 24-48 hours after verification.
                    </p>
                    <p>
                        <strong className="text-white">5.4 Verification:</strong> We reserve the right to request identity verification for withdrawals.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">6. Responsible Gaming</h2>
                    <p className="mb-4">
                        Casino Clash is committed to responsible gaming. We provide tools for self-exclusion, deposit limits, and access to problem gambling resources.
                    </p>
                    <p>
                        If you feel you have a gambling problem, please visit our <span className="text-quantum-gold cursor-pointer hover:underline" onClick={() => navigate('/responsible-gaming')}>Responsible Gaming</span> page.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">7. Limitation of Liability</h2>
                    <p className="mb-4">
                        Casino Clash shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                    </p>
                    <p>
                        <strong className="text-white">7.1 Maximum Liability:</strong> Our total liability shall not exceed the amount you deposited in the last 90 days.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">8. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service constitutes acceptance of modified terms.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">9. Contact Information</h2>
                    <p className="mb-2">
                        For questions about these Terms of Service, please contact us:
                    </p>
                    <p className="text-quantum-gold">
                        Email: legal@casinoclash.io<br />
                        Support: support@casinoclash.io
                    </p>
                </section>

                <div className="text-center py-8 text-white/40 text-sm">
                    <p>© 2026 Casino Clash: Quantum Legacy. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
