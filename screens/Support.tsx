
import React, { useState } from 'react';
import { getQuantumAdvice } from '../services/geminiService';

const Support: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askOracle = async () => {
    if (!query) return;
    setLoading(true);
    const result = await getQuantumAdvice(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-10 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black italic uppercase">Legal & <span className="text-primary">Support</span></h2>
        <p className="text-gray-400 text-lg">Direct access to account assistance and the Quantum Oracle AI assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-4xl">neurology</span>
            <h3 className="text-2xl font-bold uppercase italic">Quantum Oracle AI</h3>
          </div>
          <p className="text-gray-400">Ask the AI about game mechanics, lucky numbers, or platform rules.</p>
          
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <textarea 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="How do I play Plinko? Give me a lucky prediction for Roulette..."
              className="bg-transparent border-none p-0 text-white placeholder-gray-600 focus:ring-0 resize-none h-24"
            />
            <button 
              onClick={askOracle}
              disabled={loading}
              className="self-end px-8 py-3 bg-primary text-black font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(242,208,13,0.3)]"
            >
              {loading ? 'Consulting Core...' : 'Ask Oracle'}
            </button>
          </div>

          {response && (
            <div className="p-6 bg-plasma/10 border border-plasma/30 rounded-2xl animate-fade-in">
              <p className="text-sm font-bold text-plasma mb-2 uppercase tracking-widest">Oracle Response:</p>
              <p className="text-gray-200 leading-relaxed italic">"{response}"</p>
            </div>
          )}
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500">description</span> Legal Docs
          </h3>
          <ul className="flex flex-col gap-4">
            <li className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/5 flex justify-between group">
              <span>Terms of Service</span>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-primary">chevron_right</span>
            </li>
            <li className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/5 flex justify-between group">
              <span>Privacy Policy</span>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-primary">chevron_right</span>
            </li>
            <li className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/5 flex justify-between group">
              <span>Responsible Gaming</span>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-primary">chevron_right</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Support;
