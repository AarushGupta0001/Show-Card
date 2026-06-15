import { useState, useEffect } from 'react';
import type { GameState } from '../types';
import { useGame } from '../context/GameContext';
import { loadState } from '../utils/gameLogic';

export default function RestoreModal() {
  const { dispatch } = useGame();
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state && state.screen !== 'setup') {
      setSavedState(state);
      setShow(true);
    }
  }, []);

  if (!show || !savedState) return null;

  const progress     = `Round ${savedState.currentRound} of ${savedState.config.totalRounds}`;
  const playerNames  = savedState.config.players.map(p => p.name).join(' · ');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 anim-fade-in"
           style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }} />

      <div className="relative w-full max-w-sm anim-bounce-in"
           style={{
             background: 'var(--bg-surface)',
             border: '1px solid rgba(99,102,241,0.3)',
             borderRadius: '24px',
             boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
             overflow: 'hidden',
           }}>
        {/* Header accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💾</div>
            <h2 className="font-outfit font-black text-xl text-white mb-1">Continue Game?</h2>
            <p className="text-slate-500 text-sm">A saved session was found</p>
          </div>

          {/* Info */}
          <div className="rounded-2xl p-4 mb-5 space-y-3"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Progress</span>
              <span className="text-indigo-400 font-bold text-sm">{progress}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex-shrink-0">Players</span>
              <span className="text-white text-xs font-medium text-right">{playerNames}</span>
            </div>
            {savedState.config.startingWallet && (
              <>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Wallet</span>
                  <span className="text-amber-400 font-bold text-sm">₹{savedState.config.startingWallet}</span>
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShow(false)}
              id="discard-save-btn"
              className="btn-ghost"
              style={{ padding: '12px', borderRadius: '12px', borderColor: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)' }}
            >
              Discard
            </button>
            <button
              onClick={() => { dispatch({ type: 'RESTORE_GAME', state: savedState }); setShow(false); }}
              id="restore-game-btn"
              className="btn-primary"
              style={{ padding: '12px', borderRadius: '12px' }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
