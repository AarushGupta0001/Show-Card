import React, { useState } from 'react';
import type { Round, CardValue } from '../types';
import { useGame } from '../context/GameContext';
import { getPlayerTotal } from '../utils/gameLogic';

const SUITS: Record<CardValue, { suit: string; isRed: boolean }> = {
  '1':  { suit: '♠', isRed: false }, '2': { suit: '♥', isRed: true  },
  '3':  { suit: '♦', isRed: true  }, '4': { suit: '♣', isRed: false },
  '5':  { suit: '♠', isRed: false }, '6': { suit: '♥', isRed: true  },
  '7':  { suit: '♦', isRed: true  }, '8': { suit: '♣', isRed: false },
  '9':  { suit: '♠', isRed: false }, '10': { suit: '♥', isRed: true },
  'J':  { suit: '♦', isRed: true  }, 'Q': { suit: '♣', isRed: false },
  'K':  { suit: '♠', isRed: false },
};

function cardNum(card: CardValue): number {
  const m: Record<string, number> = {
    '1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,
  };
  return m[card] ?? 0;
}

// ── Round history drawer ──────────────────────────────────────────────────────
function RoundHistoryDrawer({
  round, players, onClose, onEdit,
}: {
  round: Round;
  players: { id: string; name: string }[];
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 anim-fade-in"
           style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
           onClick={onClose} />

      <div className="relative w-full sm:max-w-md anim-slide-up overflow-hidden"
           style={{
             background: 'var(--bg-surface)',
             borderRadius: '24px 24px 0 0',
             border: '1px solid rgba(99,102,241,0.2)',
             borderBottom: 'none',
             maxHeight: '85dvh',
             overflowY: 'auto',
           }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 className="text-white font-bold text-base">Round {round.roundNumber}</h3>
            <p className="text-slate-500 text-xs mt-0.5">Tap "Edit" to modify scores</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              id={`edit-round-${round.roundNumber}`}
              className="btn-ghost text-xs px-3 py-1.5"
              style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--text-accent)' }}
            >
              ✏️ Edit Round
            </button>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 3L3 11M3 3l8 8"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {round.entries.map(entry => {
            const player   = players.find(p => p.id === entry.playerId);
            const hasCards = entry.groups.some(g => g.cards.length > 0);
            const avatarColor = `hsl(${((player?.name.charCodeAt(0) ?? 80) * 23 + 220) % 360}, 55%, 42%)`;

            return (
              <div key={entry.playerId} className="rounded-2xl overflow-hidden"
                   style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Player header */}
                <div className="flex items-center justify-between px-4 py-3"
                     style={{ borderBottom: hasCards ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                         style={{ background: avatarColor }}>
                      {player?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold text-sm">{player?.name}</span>
                    {entry.doubleScore && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                        ×2
                      </span>
                    )}
                  </div>
                  <span className="font-outfit font-black text-xl text-indigo-300">{entry.score}</span>
                </div>

                {/* Card breakdown */}
                {hasCards && (
                  <div className="px-4 py-3 space-y-2">
                    {entry.groups.map((group, gi) => (
                      <div key={group.id}>
                        {entry.groups.length > 1 && (
                          <p className="text-[10px] text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Group {gi + 1}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {group.cards.map((card, ci) => {
                            const { suit, isRed } = SUITS[card];
                            return (
                              <React.Fragment key={ci}>
                                {ci > 0 && <span className="text-slate-600 text-xs font-bold">+</span>}
                                <span className={`text-sm font-bold ${isRed ? 'text-red-400' : 'text-slate-200'}`}>
                                  {card}{suit}
                                  <span className="text-slate-600 text-[10px] ml-0.5">({cardNum(card)})</span>
                                </span>
                              </React.Fragment>
                            );
                          })}
                          <span className="text-slate-600 text-xs font-bold ml-1">=</span>
                          <span className="text-indigo-400 font-bold text-sm">
                            {group.cards.reduce((s, c) => s + cardNum(c), 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {entry.groups.length > 1 && (
                      <p className="text-xs text-slate-400 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        Raw: {entry.rawScore}{entry.doubleScore ? ` × 2 = ${entry.score}` : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Zero score */}
                {!hasCards && (
                  <div className="px-4 py-2">
                    <span className="text-slate-600 text-xs">No cards played — scored 0</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Leaderboard ──────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { state, dispatch } = useGame();
  const { config, rounds }  = state;
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);

  const submitted = rounds.filter(r => r.submitted);

  const handleEditRound = (roundIndex: number) => {
    dispatch({ type: 'EDIT_ROUND', roundIndex });
    setSelectedRound(null);
  };

  if (submitted.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center"
           style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-3xl mb-3 opacity-30">📊</div>
        <p className="text-slate-600 text-sm">Leaderboard appears after Round 1</p>
      </div>
    );
  }

  // Sort players by total for rank indicator (least points wins)
  const rankedPlayers = config.players.map(p => ({
    ...p,
    total: getPlayerTotal(p.id, submitted),
  })).sort((a, b) => a.total - b.total);

  return (
    <>
      <div className="rounded-2xl overflow-hidden"
           style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="font-outfit font-bold text-base text-white">Leaderboard</h2>
            <p className="text-slate-600 text-xs mt-0.5">Tap round to view details</p>
          </div>
          <span className="text-xs text-slate-600 font-semibold">{submitted.length}/{config.totalRounds} rounds</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th className="text-left px-5 py-3 text-xs text-slate-600 font-semibold uppercase tracking-wider sticky left-0"
                    style={{ background: 'var(--bg-card)', minWidth: '120px' }}>
                  Player
                </th>
                {submitted.map(r => (
                  <th key={r.roundNumber} className="px-3 py-3 text-center">
                    <button
                      onClick={() => setSelectedRound(r)}
                      id={`round-header-${r.roundNumber}`}
                      className="text-xs text-slate-500 font-semibold hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-500/10"
                    >
                      R{r.roundNumber}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--amber)' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
              {rankedPlayers.map((player, index) => {
                const total = player.total;
                const rank  = index + 1;
                const avatarColor = `hsl(${(player.name.charCodeAt(0) * 23 + 220) % 360}, 55%, 42%)`;

                return (
                  <tr key={player.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3.5 sticky left-0"
                        style={{ background: 'var(--bg-card)' }}>
                      <div className="flex items-center gap-2.5">
                        {/* Rank indicator */}
                        <div className="flex-shrink-0 text-center" style={{ minWidth: '16px' }}>
                          {rank === 1 && <span className="text-sm rank-gold">🥇</span>}
                          {rank === 2 && <span className="text-xs rank-silver font-black">2</span>}
                          {rank === 3 && <span className="text-xs rank-bronze font-black">3</span>}
                          {rank > 3   && <span className="text-xs text-slate-700 font-bold">{rank}</span>}
                        </div>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-[10px] flex-shrink-0"
                             style={{ background: avatarColor }}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-xs truncate max-w-[80px]">{player.name}</span>
                      </div>
                    </td>

                    {submitted.map(r => {
                      const entry = r.entries.find(e => e.playerId === player.id);
                      const score = entry?.score ?? 0;
                      return (
                        <td key={r.roundNumber} className="px-3 py-3.5 text-center">
                          <span className={`font-semibold text-sm ${score === 0 ? 'text-slate-700' : 'text-white'}`}>
                            {score}
                          </span>
                          {entry?.doubleScore && (
                            <span className="text-[9px] text-amber-500 ml-0.5 font-bold">×2</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-outfit font-black text-lg text-gradient-gold">{total}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRound && (
        <RoundHistoryDrawer
          round={selectedRound}
          players={config.players}
          onClose={() => setSelectedRound(null)}
          onEdit={() => {
            const idx = rounds.findIndex(r => r.roundNumber === selectedRound.roundNumber);
            handleEditRound(idx);
          }}
        />
      )}
    </>
  );
}
