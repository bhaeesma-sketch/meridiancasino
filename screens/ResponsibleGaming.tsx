import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResponsibleGaming: React.FC = () => {
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
                    Responsible Gaming
                </h1>
                <p className="text-white/60 text-sm">
                    Play Responsibly. Enjoy Safely.
                </p>
            </div>

            <div className="space-y-6 text-white/80">
                <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-green-400 text-4xl">health_and_safety</span>
                        <div>
                            <h2 className="text-2xl font-heading font-black text-white">Our Commitment</h2>
                            <p className="text-green-400 text-sm">Gaming should be fun and entertaining</p>
                        </div>
                    </div>
                    <p>
                        At Meridian Casino Clash, we are committed to providing a safe and responsible gaming environment. While gambling can be entertaining, we recognize that for some players, it can become a problem. We provide tools and resources to help you stay in control.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">1. Self-Assessment</h2>
                    <p className="mb-4">
                        Ask yourself these questions. If you answer "yes" to several of them, you may need help:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/70">
                        <li>Do you spend more time and money gambling than you can afford?</li>
                        <li>Do you feel the need to be secretive about your gambling?</li>
                        <li>Do you have trouble controlling your gambling?</li>
                        <li>Has gambling affected your relationships or work?</li>
                        <li>Do you gamble to escape problems or relieve stress?</li>
                        <li>Have you tried to win back losses by gambling more?</li>
                        <li>Do you feel guilty or anxious about your gambling?</li>
                    </ul>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">2. Responsible Gaming Tools</h2>

                    <div className="space-y-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-cyan-400">schedule</span>
                                Deposit Limits
                            </h3>
                            <p className="text-sm text-white/70">
                                Set daily, weekly, or monthly deposit limits to control your spending. Contact support to set up limits.
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">timer</span>
                                Session Time Limits
                            </h3>
                            <p className="text-sm text-white/70">
                                Set reminders for how long you've been playing. Take regular breaks to stay in control.
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-400">block</span>
                                Self-Exclusion
                            </h3>
                            <p className="text-sm text-white/70">
                                Temporarily or permanently exclude yourself from Meridian Casino Clash. Options available for 24 hours, 7 days, 30 days, or permanently.
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-400">pause</span>
                                Reality Checks
                            </h3>
                            <p className="text-sm text-white/70">
                                Enable periodic reminders showing how long you've been playing and your session activity.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-quantum-gold/10 border border-quantum-gold/30 rounded-xl">
                        <p className="text-sm text-white/80">
                            <strong className="text-quantum-gold">To enable any of these features:</strong> Contact our support team at support@casinoclash.io or use the support chat.
                        </p>
                    </div>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">3. Underage Gambling Prevention</h2>
                    <p className="mb-4">
                        Meridian Casino Clash strictly prohibits underage gambling. You must be at least 18 years old (or the legal age in your jurisdiction) to use our platform.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">Parents and Guardians:</strong> We recommend using parental control software to prevent minors from accessing gambling sites.
                    </p>
                    <p>
                        Recommended tools: <span className="text-quantum-gold">Net Nanny, Qustodio, Norton Family</span>
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">4. Problem Gambling Help</h2>
                    <p className="mb-4">
                        If you or someone you know has a gambling problem, help is available:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2">🇺🇸 United States</h3>
                            <p className="text-sm text-quantum-gold mb-1">National Council on Problem Gambling</p>
                            <p className="text-sm text-white/70">1-800-522-4700</p>
                            <p className="text-xs text-white/50 mt-1">ncpgambling.org</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2">🇬🇧 United Kingdom</h3>
                            <p className="text-sm text-quantum-gold mb-1">GamCare</p>
                            <p className="text-sm text-white/70">0808 8020 133</p>
                            <p className="text-xs text-white/50 mt-1">gamcare.org.uk</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2">🇨🇦 Canada</h3>
                            <p className="text-sm text-quantum-gold mb-1">Problem Gambling Institute</p>
                            <p className="text-sm text-white/70">1-866-531-2600</p>
                            <p className="text-xs text-white/50 mt-1">problemgambling.ca</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2">🌍 International</h3>
                            <p className="text-sm text-quantum-gold mb-1">Gamblers Anonymous</p>
                            <p className="text-sm text-white/70">Find local meetings</p>
                            <p className="text-xs text-white/50 mt-1">gamblersanonymous.org</p>
                        </div>
                    </div>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">5. Tips for Responsible Gaming</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Set a Budget</p>
                                <p className="text-sm text-white/70">Only gamble what you can afford to lose</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Set Time Limits</p>
                                <p className="text-sm text-white/70">Don't let gambling interfere with daily life</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Take Breaks</p>
                                <p className="text-sm text-white/70">Step away regularly to keep perspective</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Don't Chase Losses</p>
                                <p className="text-sm text-white/70">Trying to win back losses often leads to bigger losses</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Never Borrow to Gamble</p>
                                <p className="text-sm text-white/70">Only use disposable income</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 flex-shrink-0">check_circle</span>
                            <div>
                                <p className="font-bold text-white mb-1">Keep It Fun</p>
                                <p className="text-sm text-white/70">Gambling should be entertainment, not income</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
                        <div>
                            <h2 className="text-2xl font-heading font-black text-white mb-2">Need Help Now?</h2>
                            <p className="text-white/80 mb-4">
                                If you're struggling with gambling, please reach out for help immediately. You're not alone.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="mailto:support@casinoclash.io" className="px-4 py-2 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                                    Contact Support
                                </a>
                                <button className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                                    Request Self-Exclusion
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center py-8 text-white/40 text-sm">
                    <p>© 2026 Meridian Casino Clash: Quantum Legacy. All rights reserved.</p>
                    <p className="mt-2">When the fun stops, stop.</p>
                </div>
            </div>
        </div>
    );
};

export default ResponsibleGaming;
