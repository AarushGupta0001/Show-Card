import React, { useState, useRef, useEffect } from 'react';
import type { Player, CardValue } from '../types';
import { ALL_CARDS, CARD_NUMERIC } from '../types';
import { useGame } from '../context/GameContext';
import { computeGroupScore } from '../utils/gameLogic';

// ─── Suit helper ─────────────────────────────────────────────────────────────
const SUITS: Record<CardValue, { suit: string; isRed: boolean }> = {
  '1':  { suit: '♠', isRed: false },
  '2':  { suit: '♥', isRed: true  },
  '3':  { suit: '♦', isRed: true  },
  '4':  { suit: '♣', isRed: false },
  '5':  { suit: '♠', isRed: false },
  '6':  { suit: '♥', isRed: true  },
  '7':  { suit: '♦', isRed: true  },
  '8':  { suit: '♣', isRed: false },
  '9':  { suit: '♠', isRed: false },
  '10': { suit: '♥', isRed: true  },
  'J':  { suit: '♦', isRed: true  },
  'Q':  { suit: '♣', isRed: false },
  'K':  { suit: '♠', isRed: false },
};

// ─── Large Card Tile ──────────────────────────────────────────────────────────
function CardTile({ card, onClick }: { card: CardValue; onClick: () => void }) {
  const { suit, isRed } = SUITS[card];
  const val = CARD_NUMERIC[card];

  return (
    <button
      type="button"
      className="card-tile"
      style={{ height: '90px', width: '100%' }}
      onClick={onClick}
      aria-label={`Select card ${card} (value ${val})`}
    >
      {/* Top-left label */}
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
        <span className={`font-black text-sm leading-none ${isRed ? 'suit-red' : 'suit-black'}`}>{card}</span>
      </div>

      {/* Center suit — big */}
      <div className="flex items-center justify-center w-full h-full">
        <span className={`text-2xl leading-none select-none ${isRed ? 'suit-red' : 'suit-black'}`}>
          {suit}
        </span>
      </div>

      {/* Bottom value */}
      <div className="absolute bottom-1.5 right-2">
        <span className="text-[10px] font-bold text-slate-600">{val}</span>
      </div>
    </button>
  );
}

// ─── Selected card chip ───────────────────────────────────────────────────────
function CardChip({ card, onRemove }: { card: CardValue; onRemove?: () => void }) {
  const { suit, isRed } = SUITS[card];
  return (
    <div className="card-chip group">
      <span className={`font-black text-sm ${isRed ? 'suit-red' : 'text-slate-100'}`}>{card}{suit}</span>
      <span className="text-slate-500 text-xs">{CARD_NUMERIC[card]}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] leading-none hover:bg-red-500/40 transition-all opacity-0 group-hover:opacity-100"
        >×</button>
      )}
    </div>
  );
}

// ─── Card Formula row ─────────────────────────────────────────────────────────
function CardFormula({ cards, score, doubleScore }: { cards: CardValue[]; score: number; doubleScore?: boolean }) {
  if (cards.length === 0) return (
    <div className="flex items-center gap-2 min-h-10">
      <span className="text-slate-600 text-sm">Tap cards below to add them</span>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-10">
      {cards.map((card, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-slate-600 font-bold text-sm">+</span>}
          <CardChip card={card} />
        </React.Fragment>
      ))}
      <span className="text-slate-500 font-bold text-sm mx-1">=</span>
      <span className="font-outfit font-black text-2xl text-indigo-300">{score}</span>
      {doubleScore && (
        <>
          <span className="text-slate-500 font-bold text-sm">× 2</span>
          <span className="font-outfit font-black text-2xl text-amber-400">{score * 2}</span>
        </>
      )}
    </div>
  );
}

// ─── Player summary card (on game screen) ────────────────────────────────────
function PlayerSummaryCard({ player, onClick }: { player: Player; onClick: () => void }) {
  const { getDraftEntry, getDraftTotalScore } = useGame();
  const entry      = getDraftEntry(player.id);
  const totalScore = getDraftTotalScore(player.id);
  const hasCards   = entry?.groups.some(g => g.cards.length > 0) ?? false;

  const avatarColor = `hsl(${(player.name.charCodeAt(0) * 23 + 220) % 360}, 55%, 42%)`;

  return (
    <button
      onClick={onClick}
      id={`player-card-${player.id}`}
      className="w-full text-left rounded-2xl transition-all duration-200 overflow-hidden relative group"
      style={{
        background: hasCards
          ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(26,29,46,0.95) 60%)'
          : 'var(--bg-card)',
        border: hasCards
          ? '1.5px solid rgba(99,102,241,0.4)'
          : '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: hasCards ? '0 4px 24px rgba(99,102,241,0.15)' : 'none',
        padding: '16px',
      }}
    >
      {/* Double badge */}
      {entry?.doubleScore && (
        <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
          ×2
        </span>
      )}

      {/* Player info */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
             style={{ background: avatarColor }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-white font-semibold text-sm truncate">{player.name}</span>
      </div>

      {hasCards ? (
        <div>
          <div className="font-outfit font-black text-3xl text-indigo-300 leading-none mb-1">{totalScore}</div>
          {entry && entry.groups.length > 1 && (
            <div className="text-[10px] text-slate-500">
              {entry.groups.map(g => computeGroupScore(g)).join(' + ')} = {totalScore}
            </div>
          )}
          {/* Mini card preview */}
          <div className="flex flex-wrap gap-1 mt-2">
            {entry?.groups.map((group, gi) => (
              <div key={group.id} className="flex items-center gap-0.5">
                {gi > 0 && <span className="text-slate-600 text-[10px] mx-0.5">|</span>}
                {group.cards.map((card, ci) => (
                  <span key={ci} className={`text-[11px] font-bold ${SUITS[card].isRed ? 'suit-red' : 'text-slate-300'}`}>
                    {card}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-slate-600 text-xs mb-1">No score yet</div>
          <div className="text-slate-700 text-lg group-hover:text-slate-500 transition-colors">+</div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-[14px] bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}

// ─── Main PlayerCard component (with modal) ───────────────────────────────────
interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { state, dispatch, getDraftEntry, getDraftTotalScore } = useGame();
  const [isOpen, setIsOpen]   = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [collectionMode, setCollectionMode] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const entry      = getDraftEntry(player.id);
  const totalScore = getDraftTotalScore(player.id);

  // Auto-scroll card grid into view when modal opens
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      setTimeout(() => sheetRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }, [isOpen]);

  if (!entry) return <PlayerSummaryCard player={player} onClick={() => {}} />;

  const resolvedGroupId = activeGroupId ?? entry.groups[0]?.id ?? '';
  const activeGroup     = entry.groups.find(g => g.id === resolvedGroupId);
  const activeGroupCards = activeGroup?.cards ?? [];
  const activeGroupScore = computeGroupScore(activeGroup ?? { id: '', cards: [] });
  const hasCards        = entry.groups.some(g => g.cards.length > 0);

  const addCard     = (card: CardValue) => {
    if (!resolvedGroupId) return;
    dispatch({ type: 'ADD_CARD', playerId: player.id, groupId: resolvedGroupId, card });
  };
  const removeLast  = () => {
    if (!resolvedGroupId) return;
    dispatch({ type: 'REMOVE_LAST_CARD', playerId: player.id, groupId: resolvedGroupId });
  };
  const addGroup    = () => dispatch({ type: 'ADD_GROUP', playerId: player.id });
  const removeGroup = (groupId: string) => {
    dispatch({ type: 'REMOVE_GROUP', playerId: player.id, groupId });
    if (activeGroupId === groupId) setActiveGroupId(entry.groups[0]?.id ?? null);
  };
  const toggleDouble = () => dispatch({ type: 'TOGGLE_DOUBLE', playerId: player.id });
  const setRole = (role: 'show' | 'others') => {
    dispatch({ type: 'SET_ROLE', playerId: player.id, role });
  };

  useEffect(() => {
    if (isOpen && entry) {
      const totalCards = entry.groups.reduce((acc, g) => acc + g.cards.length, 0);
      if (entry.role === 'show' && totalCards >= 3) {
        setIsOpen(false);
      } else if (entry.role === 'others' && totalCards >= 9) {
        setIsOpen(false);
      }
    }
  }, [isOpen, entry]);

  return (
    <>
      <PlayerSummaryCard player={player} onClick={() => {
        setActiveGroupId(entry.groups[0]?.id ?? null);
        setIsOpen(true);
      }} />

      {/* ── Modal (bottom sheet on mobile, centered dialog on desktop) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 anim-fade-in"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className="relative w-full sm:max-w-lg anim-slide-up overflow-y-auto"
            style={{
              maxHeight: '94dvh',
              background: 'var(--bg-surface)',
              borderRadius: '28px 28px 0 0',
              border: '1.5px solid rgba(99,102,241,0.25)',
              borderBottom: 'none',
              boxShadow: '0 -8px 48px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Handle bar (mobile) ── */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* ── Sheet Header ── */}
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                     style={{ background: `hsl(${(player.name.charCodeAt(0) * 23 + 220) % 360}, 55%, 42%)` }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">{player.name}</h3>
                  <p className="text-slate-500 text-xs">Round {state.currentRound}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 4L4 12M4 4l8 8"/>
                </svg>
              </button>
            </div>

            <div className="px-5 pb-6 space-y-4 pt-4">

              {/* ── Role Selection ── */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('show')}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${entry.role === 'show' ? 'ring-2 ring-indigo-400 bg-indigo-500/20' : 'bg-[var(--bg-card)] border border-[rgba(255,255,255,0.07)]'}`}
                >
                  <span className="text-lg font-black mb-1">Show</span>
                  <span className="text-[10px] text-slate-400">Auto-save at 3 cards</span>
                </button>
                <button
                  onClick={() => setRole('others')}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${entry.role === 'others' ? 'ring-2 ring-amber-400 bg-amber-500/20' : 'bg-[var(--bg-card)] border border-[rgba(255,255,255,0.07)]'}`}
                >
                  <span className="text-lg font-black mb-1">Others</span>
                  <span className="text-[10px] text-slate-400">Auto-save at 9 cards</span>
                </button>
              </div>

              {/* ── Toggles row ── */}
              <div className="grid grid-cols-1 gap-3">
                {/* Collection mode */}
                <div className="rounded-2xl p-3.5 flex items-center justify-between gap-2"
                     style={{ background: collectionMode ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)', border: `1px solid ${collectionMode ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Collection</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Multi-group</p>
                  </div>
                  <button
                    onClick={() => setCollectionMode(v => !v)}
                    id={`collection-mode-${player.id}`}
                    className={`toggle ${collectionMode ? 'on' : 'off'}`}
                  >
                    <span className={`toggle-thumb ${collectionMode ? 'on' : 'off'}`} />
                  </button>
                </div>

              </div>

              {/* ── Group tabs (collection mode) ── */}
              {collectionMode && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {entry.groups.map((group, gi) => {
                    const isActive = group.id === resolvedGroupId;
                    const gs = computeGroupScore(group);
                    return (
                      <button
                        key={group.id}
                        onClick={() => setActiveGroupId(group.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                          border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                          color: isActive ? 'white' : 'var(--text-secondary)',
                        }}
                      >
                        Group {gi + 1}
                        {gs > 0 && <span className="opacity-70">· {gs}</span>}
                        {entry.groups.length > 1 && (
                          <span
                            onClick={e => { e.stopPropagation(); removeGroup(group.id); }}
                            className="ml-1 opacity-60 hover:opacity-100 text-[10px]"
                          >✕</span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={addGroup}
                    id={`add-group-${player.id}`}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-indigo-400 hover:bg-indigo-500/10"
                    style={{ border: '1px solid rgba(99,102,241,0.25)' }}
                  >+ Group</button>
                </div>
              )}

              {/* ── Formula display ── */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-slate-500 font-semibold">
                    {collectionMode ? `Group ${entry.groups.findIndex(g => g.id === resolvedGroupId) + 1}` : 'Cards Selected'}
                  </span>
                  {activeGroupCards.length > 0 && (
                    <button
                      onClick={removeLast}
                      id={`remove-last-${player.id}`}
                      className="text-xs text-orange-400/70 hover:text-orange-400 font-semibold flex items-center gap-1 transition-colors"
                    >
                      ↩ Undo last
                    </button>
                  )}
                </div>
                <CardFormula cards={activeGroupCards} score={activeGroupScore} />
              </div>

              {/* ── Card Grid — LARGE TILES ── */}
              {!entry.role ? (
                <div className="py-8 text-center text-slate-500 text-sm font-semibold rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)]">
                  Please select Show or Others above to continue
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Select a Card</p>
                    
                    {/* ── Circular x2 Button ── */}
                    <button
                      onClick={toggleDouble}
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all ${entry.doubleScore ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-[var(--bg-card)] text-slate-400 border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                    >
                      x2
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_CARDS.slice(0, 4).map((card) => (
                        <CardTile key={card} card={card} onClick={() => addCard(card)} />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_CARDS.slice(4, 7).map((card) => (
                        <CardTile key={card} card={card} onClick={() => addCard(card)} />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_CARDS.slice(7, 10).map((card) => (
                        <CardTile key={card} card={card} onClick={() => addCard(card)} />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_CARDS.slice(10, 13).map((card) => (
                        <CardTile key={card} card={card} onClick={() => addCard(card)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Total score bar ── */}
              {hasCards && (
                <div className="rounded-2xl p-4"
                     style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(26,29,46,0.8))', border: '1.5px solid rgba(99,102,241,0.25)' }}>
                  <div className="flex items-end justify-between">
                    <div>
                      {collectionMode && entry.groups.length > 1 && (
                        <p className="text-xs text-slate-400 mb-1">
                          {entry.groups.map(g => computeGroupScore(g)).join(' + ')}
                          {' '}= {entry.groups.reduce((s, g) => s + computeGroupScore(g), 0)}
                          {entry.doubleScore && ' × 2'}
                        </p>
                      )}
                      {!collectionMode && entry.doubleScore && (
                        <p className="text-xs text-slate-400 mb-1">
                          {computeGroupScore(entry.groups[0])} × 2
                        </p>
                      )}
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Score</p>
                    </div>
                    <div className="score-big text-gradient">{totalScore}</div>
                  </div>
                </div>
              )}

              {/* ── Done button ── */}
              <button
                onClick={() => setIsOpen(false)}
                id={`done-player-${player.id}`}
                className="btn-primary w-full"
                style={{ borderRadius: '16px', padding: '16px', fontSize: '15px' }}
              >
                {hasCards ? `Save · ${totalScore} pts` : 'Done'}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
