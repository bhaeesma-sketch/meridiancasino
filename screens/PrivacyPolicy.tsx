import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
                    Privacy Policy
                </h1>
                <p className="text-white/60 text-sm">
                    Last Updated: January 5, 2026
                </p>
            </div>

            <div className="space-y-6 text-white/80">
                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                        <strong className="text-white">1.1 Wallet Information:</strong> We collect your cryptocurrency wallet address when you connect to Casino Clash. We do not have access to your private keys.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">1.2 Transaction Data:</strong> We record all deposits, withdrawals, bets, and game outcomes associated with your account.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">1.3 Usage Information:</strong> We automatically collect information about your device, browser, IP address, and how you interact with our platform.
                    </p>
                    <p>
                        <strong className="text-white">1.4 Referral Data:</strong> If you use a referral code or refer others, we collect information about those referral relationships.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">
                        We use the collected information to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Process your transactions and manage your account</li>
                        <li>Provide customer support and respond to inquiries</li>
                        <li>Detect and prevent fraud and abuse</li>
                        <li>Calculate and distribute referral commissions</li>
                        <li>Improve our services and user experience</li>
                        <li>Comply with legal obligations and regulations</li>
                    </ul>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">3. Data Storage and Security</h2>
                    <p className="mb-4">
                        <strong className="text-white">3.1 Storage Location:</strong> Your data is stored on secure cloud infrastructure with encryption at rest and in transit.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">3.2 Security Measures:</strong> We implement industry-standard security measures including SSL/TLS encryption, regular security audits, and access controls.
                    </p>
                    <p>
                        <strong className="text-white">3.3 Retention:</strong> We retain your data for as long as your account is active and for up to 7 years afterward for legal and regulatory compliance.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">4. Cookies and Tracking</h2>
                    <p className="mb-4">
                        Casino Clash uses cookies and similar tracking technologies to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Remember your preferences and settings</li>
                        <li>Analyze site traffic and user behavior</li>
                        <li>Detect and prevent fraud</li>
                        <li>Provide personalized experience</li>
                    </ul>
                    <p className="mt-4">
                        You can control cookies through your browser settings, but this may affect functionality.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">5. Third-Party Services</h2>
                    <p className="mb-4">
                        We may share your information with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-white">Payment Processors:</strong> For processing cryptocurrency transactions</li>
                        <li><strong className="text-white">Analytics Providers:</strong> To understand user behavior and improve our service</li>
                        <li><strong className="text-white">Security Services:</strong> For fraud detection and prevention</li>
                        <li><strong className="text-white">Legal Authorities:</strong> When required by law or to protect our rights</li>
                    </ul>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">6. Your Rights (GDPR)</h2>
                    <p className="mb-4">
                        Under GDPR, you have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                        <li><strong className="text-white">Rectification:</strong> Correct inaccurate personal data</li>
                        <li><strong className="text-white">Erasure:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                        <li><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format</li>
                        <li><strong className="text-white">Object:</strong> Object to processing of your personal data</li>
                        <li><strong className="text-white">Restrict:</strong> Request restriction of processing</li>
                    </ul>
                    <p className="mt-4">
                        To exercise these rights, contact us at privacy@casinoclash.io
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">7. Children's Privacy</h2>
                    <p>
                        Casino Clash is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">8. Changes to Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Continued use after changes constitutes acceptance.
                    </p>
                </section>

                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-heading font-black text-quantum-gold mb-4">9. Contact Us</h2>
                    <p className="mb-2">
                        For privacy-related questions or concerns:
                    </p>
                    <p className="text-quantum-gold">
                        Email: privacy@casinoclash.io<br />
                        Data Protection Officer: dpo@casinoclash.io
                    </p>
                </section>

                <div className="text-center py-8 text-white/40 text-sm">
                    <p>© 2026 Casino Clash: Quantum Legacy. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
