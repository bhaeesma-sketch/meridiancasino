import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      let value = parseInt(rank) || (rank === 'A' ? 11 : 10);
      deck.push({ suit, rank, value });
    });
  });
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const calculateScore = (cards: Card[]): number => {
  let score = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter(c => c.rank === 'A').length;

  // Handle Aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
};

const Blackjack: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(250);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [dealerHidden, setDealerHidden] = useState(true);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'DEALER_TURN' | 'RESULT'>('IDLE');
  const [message, setMessage] = useState('');
  const [isDealing, setIsDealing] = useState(false);
  const dealingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (dealingTimeoutRef.current) {
        clearTimeout(dealingTimeoutRef.current);
      }
    };
  }, []);

  const dealCard = (cards: Card[], newDeck: Card[]): { card: Card; remainingDeck: Card[] } => {
    const card = newDeck.pop()!;
    return { card, remainingDeck: newDeck };
  };

  const startGame = () => {
    if (!context || context.user.balance < bet || bet <= 0) {
      sounds.playLose();
      return;
    }

    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerCards([]);
    setDealerCards([]);
    setDealerHidden(true);
    setMessage('');
    setIsDealing(true);
    sounds.playDeal();
    context.updateBalance(-bet);

    // Deal initial cards with animation
    let remainingDeck = [...newDeck];
    const newPlayerCards: Card[] = [];
    const newDealerCards: Card[] = [];

    // Deal player card 1
    const { card: p1, remainingDeck: d1 } = dealCard(newPlayerCards, remainingDeck);
    newPlayerCards.push(p1);
    remainingDeck = d1;

    setTimeout(() => {
      // Deal dealer card 1 (hidden)
      const { card: d1, remainingDeck: d2 } = dealCard(newDealerCards, remainingDeck);
      newDealerCards.push(d1);
      remainingDeck = d2;
      setDealerCards([...newDealerCards]);
      sounds.playDeal();
    }, 300);

    setTimeout(() => {
      // Deal player card 2
      const { card: p2, remainingDeck: d3 } = dealCard(newPlayerCards, remainingDeck);
      newPlayerCards.push(p2);
      remainingDeck = d3;
      setPlayerCards([...newPlayerCards]);
      setDeck([...remainingDeck]);
      sounds.playDeal();
    }, 600);

    setTimeout(() => {
      // Deal dealer card 2
      const { card: d2, remainingDeck: d4 } = dealCard(newDealerCards, remainingDeck);
      newDealerCards.push(d2);
      remainingDeck = d4;
      setDealerCards([...newDealerCards]);
      setDeck([...remainingDeck]);

      const playerTotal = calculateScore(newPlayerCards);
      const dealerTotal = calculateScore([newDealerCards[0]]);
      setPlayerScore(playerTotal);
      setDealerScore(dealerTotal);
      setIsDealing(false);

      // Check for blackjack
      if (playerTotal === 21) {
        setTimeout(() => {
          stand();
        }, 500);
      } else {
        setGameState('PLAYING');
        setMessage('PLAYER ACTION REQUIRED');
      }
      sounds.playDeal();
    }, 900);
  };

  const hit = () => {
    if (gameState !== 'PLAYING' || isDealing) return;

    setIsDealing(true);
    sounds.playDeal();

    setTimeout(() => {
      const newPlayerCards = [...playerCards];
      const remainingDeck = [...deck];
      const { card, remainingDeck: newDeck } = dealCard(newPlayerCards, remainingDeck);

      newPlayerCards.push(card);
      setPlayerCards(newPlayerCards);
      setDeck(newDeck);

      const newScore = calculateScore(newPlayerCards);
      setPlayerScore(newScore);
      setIsDealing(false);

      if (newScore > 21) {
        sounds.playLose();
        setGameState('RESULT');
        setDealerHidden(false);
        setDealerScore(calculateScore(dealerCards));
        setMessage('SYSTEM OVERLOAD: BUST');
      } else if (newScore === 21) {
        setTimeout(() => stand(), 500);
      }
    }, 300);
  };

  const stand = async () => {
    if (gameState === 'RESULT' || isDealing) return;

    setGameState('DEALER_TURN');
    setDealerHidden(false);
    sounds.playDeal();

    let newDealerCards = [...dealerCards];
    let newDeck = [...deck];
    let newDealerScore = calculateScore(newDealerCards);

    // Dealer must hit until 17 or higher
    while (newDealerScore < 17) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const { card, remainingDeck } = dealCard(newDealerCards, newDeck);
      newDealerCards.push(card);
      newDeck = remainingDeck;
      newDealerScore = calculateScore(newDealerCards);
      setDealerCards([...newDealerCards]);
      setDeck([...newDeck]);
      setDealerScore(newDealerScore);
      sounds.playDeal();
    }

    setGameState('RESULT');
    const finalPlayerScore = playerScore;
    const finalDealerScore = newDealerScore;

    let won = false;
    let multiplier = 2;
    if (finalPlayerScore > 21) {
      setMessage('SYSTEM OVERLOAD: BUST');
    } else if (finalDealerScore > 21) {
      won = true;
      setMessage('DEALER BUST: QUANTUM VICTORY');
    } else if (finalPlayerScore === 21 && playerCards.length === 2) {
      won = true;
      multiplier = 2.5; // Blackjack pays 3:2
      setMessage('BLACKJACK: PERFECT SYNC');
    } else if (finalPlayerScore > finalDealerScore) {
      won = true;
      setMessage('QUANTUM VICTORY');
    } else if (finalPlayerScore < finalDealerScore) {
      setMessage('DEALER SYNC COMPLETE');
    } else {
      // Push
      context?.updateBalance(bet);
      setMessage('NEUTRAL SYNC: PUSH');
    }

    if (won) {
      setTimeout(() => sounds.playWin(), 200);
      const payout = bet * multiplier;
      context?.updateBalance(payout);
      context?.addHistory({
        id: Date.now().toString() + Math.random().toString(),
        game: 'Blackjack',
        multiplier,
        payout: payout / 45000,
        timestamp: Date.now(),
        username: context.user.username
      });
    } else if (!won && finalPlayerScore !== finalDealerScore) {
      setTimeout(() => sounds.playLose(), 200);
    }
  };

  const renderCard = (card: Card | null, index: number, isHidden: boolean = false) => {
    if (!card && !isHidden) return null;

    const cardColors = {
      hearts: 'text-red-500',
      diamonds: 'text-red-500',
      clubs: 'text-white',
      spades: 'text-white'
    };

    const suitIcons = {
      hearts: 'favorite',
      diamonds: 'diamond',
      clubs: 'spa',
      spades: 'invert_colors'
    };

    return (
      <div
        key={index}
        className={`card-3d relative w-14 h-20 md:w-18 md:h-26 lg:w-22 lg:h-32 rounded-lg md:rounded-xl overflow-hidden transition-all duration-500`}
        style={{
          transform: `translateX(${index * -20}px) rotateY(${isHidden ? 180 : 0}deg)`,
          transformStyle: 'preserve-3d',
          animation: `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.15}s both`
        }}
      >
        {/* Card Front */}
        <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-white via-gray-100 to-gray-200 border-2 rounded-lg md:rounded-xl flex flex-col justify-between p-1.5 md:p-2 shadow-lg ${isHidden ? 'invisible' : ''
          } ${card && (card.suit === 'hearts' || card.suit === 'diamonds') ? 'border-red-400/50' : 'border-gray-400/50'}`}>
          <span className={`font-mono font-black text-sm md:text-lg lg:text-xl ${cardColors[card?.suit || 'spades']}`}>
            {card?.rank}
          </span>
          <span className={`material-symbols-outlined ${cardColors[card?.suit || 'spades']} text-2xl md:text-3xl lg:text-4xl self-center`}>
            {suitIcons[card?.suit || 'spades']}
          </span>
          <span className={`font-mono font-black text-sm md:text-lg lg:text-xl self-end rotate-180 ${cardColors[card?.suit || 'spades']}`}>
            {card?.rank}
          </span>
        </div>

        {/* Card Back */}
        <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-2 border-purple-500/50 rounded-lg md:rounded-xl flex items-center justify-center ${isHidden ? '' : 'invisible'
          }`} style={{ transform: 'rotateY(180deg)' }}>
          <div className="w-full h-full p-2 flex items-center justify-center">
            <div className="w-full h-full border border-quantum-gold/30 rounded flex items-center justify-center bg-gradient-to-br from-black/20 to-black/40">
              <span className="material-symbols-outlined text-quantum-gold/50 text-3xl md:text-4xl">casino</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quick bet buttons
  const quickBets = [50, 250, 500, 1000, 2500];

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 h-full overflow-hidden perspective-1000 relative">
      <div className="scanline-overlay"></div>

      {/* Compact Header */}
      <div className="flex justify-between items-center z-20 mb-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-heading font-black text-white tracking-widest uppercase italic">
          Quantum <span className="text-plasma-purple">Blackjack</span>
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-plasma-purple/30 bg-plasma-purple/10">
          <span className="size-1.5 rounded-full bg-plasma-purple animate-pulse"></span>
          <span className="text-[8px] text-plasma-purple font-black uppercase tracking-widest">Neural Link Active</span>
        </div>
      </div>

      {/* Main Table Area - Resized for Viewport */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center">
        {/* Dealer Area - Compact */}
        <div className="absolute top-2 flex flex-col items-center gap-2 z-30">
          <div className="size-12 md:size-16 rounded-full p-0.5 bg-red-500/20 border-2 border-red-500/40 shadow-red-500/20">
            <img className="w-full h-full rounded-full object-cover grayscale opacity-50" src="https://picsum.photos/seed/dealer/200/200" alt="Dealer" />
          </div>
          {gameState !== 'IDLE' && (
            <div className={`px-4 py-1.5 rounded-lg border-red-500/50 bg-black/90 ${dealerScore > 21 ? 'border-red-500 shadow-red-500/50' : ''}`}>
              <div className="text-[14px] md:text-[18px] font-mono font-black text-red-500">
                {dealerHidden && gameState === 'PLAYING' ? '??' : dealerScore}
              </div>
            </div>
          )}
        </div>

        {/* Projection Table - Scaled Down */}
        <div className="w-full max-w-4xl aspect-[21/9] relative rounded-[10rem] border border-plasma-purple/30 bg-plasma-purple/5 overflow-hidden shadow-plasma-glow transform scale-90 md:scale-100">
          <div className="absolute inset-0 bg-mesh opacity-5"></div>

          {gameState !== 'IDLE' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 md:gap-10 z-20 transform -rotateX(20deg)">
              {/* Dealer Cards - Shrink */}
              <div className="flex gap-1 md:gap-2 items-center justify-center scale-90 md:scale-100">
                {dealerCards.map((card, index) => renderCard(card, index, index === 0 && dealerHidden))}
              </div>

              {/* Player Cards - Shrink */}
              <div className="flex gap-1 md:gap-2 items-center justify-center scale-90 md:scale-100">
                {playerCards.map((card, index) => renderCard(card, index, false))}
              </div>
            </div>
          )}
        </div>

        {/* Player Status - Compact */}
        <div className="absolute bottom-4 flex flex-col items-center gap-2 z-30 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-quantum-gold/30">
          {gameState !== 'IDLE' && (
            <>
              <div className="text-3xl md:text-4xl font-mono font-black text-quantum-gold tracking-tighter">
                {playerScore}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-white/50 animate-pulse">
                {message || 'SYSTEM SYNCING...'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Integrated Control Bar - No Fixed Position to prevent scroll */}
      <div className="w-full bg-black/40 border-t border-white/5 p-4 mt-2 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-1.5 flex-wrap justify-center">
            {quickBets.slice(0, 4).map(c => (
              <button
                key={c}
                onClick={() => setBet(Math.min(c, context?.user.balance || 10000))}
                disabled={isDealing || gameState === 'PLAYING' || gameState === 'DEALER_TURN'}
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-[10px] transition-all ${c === bet ? 'bg-plasma-purple/20 border-plasma-purple text-plasma-purple' : 'bg-white/5 border-white/10 text-white/50'}`}
              >
                ${c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {gameState === 'IDLE' || gameState === 'RESULT' ? (
              <button
                onClick={startGame}
                disabled={!context || context.user.balance < bet || isDealing}
                className="flex-1 md:flex-none px-12 py-3 bg-quantum-gold text-black font-black uppercase rounded-xl shadow-gold-glow hover:scale-[1.02] active:scale-95 transition-all text-xs"
              >
                INITIATE HAND
              </button>
            ) : (
              <>
                <button
                  onClick={stand}
                  disabled={isDealing || gameState === 'DEALER_TURN'}
                  className="flex-1 md:flex-none px-8 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all uppercase text-xs"
                >
                  HOLD
                </button>
                <button
                  onClick={hit}
                  disabled={isDealing || gameState !== 'PLAYING' || playerScore >= 21}
                  className="flex-1 md:flex-none px-12 py-3 bg-plasma-purple text-white font-black rounded-xl shadow-plasma-glow hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs"
                >
                  HIT
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;