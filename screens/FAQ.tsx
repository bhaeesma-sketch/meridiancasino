import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
    question: string;
    answer: string;
    category: 'getting-started' | 'deposits' | 'bonuses' | 'games' | 'technical' | 'security';
}

const FAQ: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const categories = [
        { id: 'all', name: 'All', icon: 'apps' },
        { id: 'getting-started', name: 'Getting Started', icon: 'rocket_launch' },
        { id: 'deposits', name: 'Deposits & Withdrawals', icon: 'account_balance_wallet' },
        { id: 'bonuses', name: 'Bonuses & Referrals', icon: 'card_giftcard' },
        { id: 'games', name: 'Games', icon: 'casino' },
        { id: 'technical', name: 'Technical', icon: 'settings' },
        { id: 'security', name: 'Security', icon: 'lock' },
    ];

    const faqs: FAQItem[] = [
        {
            category: 'getting-started',
            question: 'How do I get started on Meridian Casino Clash?',
            answer: 'Simply connect your MetaMask or TronLink wallet on the Auth page. You\'ll receive a $10 welcome bonus instantly (or $25 if you use a referral code). You can also play as a guest in demo mode to try out the games first.'
        },
        {
            category: 'getting-started',
            question: 'Do I need cryptocurrency to play?',
            answer: 'For real money gaming, yes. Meridian Casino Clash accepts USDT (TRC20), TRX, and BTC. However, you can play in demo mode as a guest without any cryptocurrency.'
        },
        {
            category: 'getting-started',
            question: 'What wallets are supported?',
            answer: 'We currently support MetaMask (for Ethereum-based tokens) and TronLink (for TRX and TRC20 tokens). Make sure you have one of these wallets installed in your browser.'
        },
        {
            category: 'deposits',
            question: 'How do I deposit funds?',
            answer: 'Click the "Deposit" button in your profile or sidebar. You can deposit USDT (TRC20), TRX, or BTC. The minimum deposit is $10 USDT equivalent. Funds are credited instantly after blockchain confirmation.'
        },
        {
            category: 'deposits',
            question: 'How long do withdrawals take?',
            answer: 'Withdrawals are processed within 24-48 hours. The minimum withdrawal amount is $20 USDT equivalent. We may request identity verification for large withdrawals.'
        },
        {
            category: 'deposits',
            question: 'Are there any fees?',
            answer: 'Meridian Casino Clash does not charge deposit or withdrawal fees. However, you will need to pay standard blockchain network fees (gas fees) when making transactions.'
        },
        {
            category: 'bonuses',
            question: 'What is the welcome bonus?',
            answer: 'New users receive $10 instantly upon signup. If you use a referral code, you get $25 instead - that\'s 150% more! All bonuses have a 1.5x wagering requirement before withdrawal.'
        },
        {
            category: 'bonuses',
            question: 'How does the referral program work?',
            answer: 'Share your unique referral code with friends. When they sign up and play, they get $25 instead of $10, and you earn 5-25% commission on their wagering based on your tier level. It\'s a win-win!'
        },
        {
            category: 'bonuses',
            question: 'What are the wagering requirements?',
            answer: 'All bonuses require 1.5x wagering before withdrawal. For example, if you receive a $10 bonus, you need to wager $15 total before you can withdraw. This is one of the lowest requirements in the industry!'
        },
        {
            category: 'bonuses',
            question: 'How do I increase my tier level?',
            answer: 'Your tier level increases based on your total wagering volume. Higher tiers unlock better referral commission rates (up to 25%), exclusive bonuses, and VIP rewards. Check your Profile to see your current tier and progress.'
        },
        {
            category: 'games',
            question: 'Are the games fair?',
            answer: 'Absolutely! All Meridian Casino Clash games use quantum-verified random number generation to ensure complete fairness. Every game outcome is provably fair and can be verified independently.'
        },
        {
            category: 'games',
            question: 'Which games are available?',
            answer: 'Meridian Casino Clash offers Dice, Plinko, Blackjack, Roulette, and Limbo. Each game has its own unique quantum-themed design and provably fair mechanics. More games are being added regularly!'
        },
        {
            category: 'games',
            question: 'Can I play on mobile?',
            answer: 'Yes! Meridian Casino Clash is fully responsive and works perfectly on mobile devices. Simply visit the site on your mobile browser. We recommend using MetaMask Mobile or TronLink Mobile app for the best experience.'
        },
        {
            category: 'games',
            question: 'What are the betting limits?',
            answer: 'Minimum bet varies by game but typically starts at $0.10. Maximum bets depend on your tier level and game type. VIP players have access to higher limits.'
        },
        {
            category: 'technical',
            question: 'Why is my wallet not connecting?',
            answer: 'Make sure you have MetaMask or TronLink installed and unlocked. Clear your browser cache and try again. If using MetaMask, ensure you\'re on the correct network. For TronLink, make sure you\'re logged in to the extension.'
        },
        {
            category: 'technical',
            question: 'The site is loading slowly. What should I do?',
            answer: 'Try clearing your browser cache, disabling browser extensions temporarily, or switching to a different browser. Make sure you have a stable internet connection. The site works best on Chrome, Firefox, or Brave.'
        },
        {
            category: 'technical',
            question: 'Can I use a VPN?',
            answer: 'VPN usage is allowed, but please ensure you\'re accessing Meridian Casino Clash from a jurisdiction where online gambling is legal. We reserve the right to ask for verification if suspicious activity is detected.'
        },
        {
            category: 'security',
            question: 'Is my money safe?',
            answer: 'Yes! Your funds are secured by blockchain technology. We never have access to your private keys. All transactions are transparent and verifiable on the blockchain.'
        },
        {
            category: 'security',
            question: 'Do you store my private keys?',
            answer: 'Absolutely not! Meridian Casino Clash never has access to your private keys. You maintain full control of your wallet at all times. We only interact with your wallet through secure Web3 connections.'
        },
        {
            category: 'security',
            question: 'How do you protect my data?',
            answer: 'We use industry-standard encryption (SSL/TLS) for all connections. Your wallet address is the only personal information we collect. We never sell or share your data. See our Privacy Policy for more details.'
        },
        {
            category: 'security',
            question: 'What if I lose access to my wallet?',
            answer: 'Since Meridian Casino Clash is non-custodial, you are responsible for your wallet security. We cannot recover lost private keys or seed phrases. Always backup your wallet recovery phrase in a secure location.'
        },
    ];

    const filteredFAQs = activeCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="text-sm font-bold uppercase">Back</span>
                </button>

                <h1 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-quantum-gold via-yellow-200 to-quantum-gold mb-2">
                    Frequently Asked Questions
                </h1>
                <p className="text-white/60 text-sm">
                    Find answers to common questions about Meridian Casino Clash
                </p>
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase whitespace-nowrap transition-all ${activeCategory === category.id
                                ? 'bg-quantum-gold text-black shadow-gold-glow'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">{category.icon}</span>
                        {category.name}
                    </button>
                ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden transition-all hover:border-quantum-gold/30"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-1">{faq.question}</h3>
                                <span className="text-xs text-white/40 uppercase tracking-wider">
                                    {categories.find(c => c.id === faq.category)?.name}
                                </span>
                            </div>
                            <span className={`material-symbols-outlined text-quantum-gold transition-transform ${openIndex === index ? 'rotate-180' : ''
                                }`}>
                                expand_more
                            </span>
                        </button>

                        {openIndex === index && (
                            <div className="px-5 pb-5 pt-0 text-white/70 text-sm leading-relaxed border-t border-white/5">
                                <p className="mt-3">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-br from-quantum-gold/10 to-purple-500/10 backdrop-blur-xl border border-quantum-gold/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-quantum-gold text-4xl">support_agent</span>
                    <div className="flex-1">
                        <h2 className="text-2xl font-heading font-black text-white mb-2">Still Need Help?</h2>
                        <p className="text-white/70 mb-4">
                            Can't find the answer you're looking for? Our support team is here to help 24/7.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/support')}
                                className="px-6 py-3 bg-quantum-gold text-black font-black rounded-xl shadow-gold-glow hover:bg-yellow-500 transition-colors uppercase text-sm"
                            >
                                Contact Support
                            </button>
                            <a
                                href="mailto:support@casinoclash.io"
                                className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors uppercase text-sm"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center py-8 text-white/40 text-sm">
                <p>© 2026 Meridian Casino Clash: Quantum Legacy. All rights reserved.</p>
            </div>
        </div>
    );
};

export default FAQ;
