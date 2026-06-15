import { useState } from 'react';
import type { Player } from '../types';
import { useGame } from '../context/GameContext';
import { createPlayer } from '../utils/gameLogic';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MIN_ROUNDS  = 1;
const MAX_ROUNDS  = 20;

function PlayerRow({
  player, index, onNameChange, onRemove, canRemove,
}: {
  player: Player; index: number;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl surface-elevated transition-all duration-200"
         style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
           style={{ background: `hsl(${(index * 47 + 220) % 360}, 60%, 40%)` }}>
        {index + 1}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={player.name}
        onChange={(e) => onNameChange(player.id, e.target.value)}
        className="flex-1 bg-transparent outline-none text-white font-semibold text-sm placeholder-slate-600"
        placeholder={`Player ${index + 1}`}
        maxLength={20}
        id={`player-name-${player.id}`}
      />

      {canRemove && (
        <button
          onClick={() => onRemove(player.id)}
          aria-label="Remove player"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 3L3 11M3 3l8 8"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function Stepper({ value, min, max, onChange, id }: {
  value: number; min: number; max: number;
  onChange: (v: number) => void; id: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={`${id}-dec`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 rounded-xl surface-elevated flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >−</button>
      <span className="w-12 text-center text-2xl font-black text-white font-outfit">{value}</span>
      <button
        id={`${id}-inc`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 rounded-xl surface-elevated flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >+</button>
    </div>
  );
}

export default function SetupScreen() {
  const { dispatch } = useGame();
  const [players, setPlayers] = useState<Player[]>([
    createPlayer(0), createPlayer(1), createPlayer(2), createPlayer(3),
  ]);
  const [totalRounds, setTotalRounds]     = useState(5);
  const [walletEnabled, setWalletEnabled] = useState(false);
  const [startingWallet, setStartingWallet] = useState('');

  const addPlayer    = () => players.length < MAX_PLAYERS && setPlayers(p => [...p, createPlayer(p.length)]);
  const removePlayer = (id: string) => players.length > MIN_PLAYERS && setPlayers(p => p.filter(pl => pl.id !== id));
  const updateName   = (id: string, name: string) => setPlayers(p => p.map(pl => pl.id === id ? {...pl, name} : pl));

  const handleStart = () => {
    const clean = players.map((p, i) => ({ ...p, name: p.name.trim() || `Player ${i+1}` }));
    dispatch({
      type: 'START_GAME',
      config: {
        players: clean,
        totalRounds,
        startingWallet: walletEnabled && startingWallet ? parseFloat(startingWallet) : undefined,
      },
    });
  };

  return (
    <div className="page-bg min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Logo */}
      <div className="text-center mb-8 anim-slide-down">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 anim-float"
             style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
          <span className="text-3xl">🃏</span>
        </div>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-gradient mb-1">Show Cards</h1>
        <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Score Tracker</p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md anim-slide-up">
        <div className="glass-panel rounded-3xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)' }}>

          {/* Game config section */}
          <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Game Setup</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Rounds */}
              <div className="surface rounded-2xl p-4" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs text-slate-500 font-semibold mb-3">Total Rounds</p>
                <Stepper value={totalRounds} min={MIN_ROUNDS} max={MAX_ROUNDS} onChange={setTotalRounds} id="rounds" />
              </div>

              {/* Wallet */}
              <div className="surface rounded-2xl p-4" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 font-semibold">Wallet</p>
                  <button
                    onClick={() => setWalletEnabled(v => !v)}
                    id="wallet-toggle"
                    className={`toggle ${walletEnabled ? 'on' : 'off'}`}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <span className={`toggle-thumb ${walletEnabled ? 'on' : 'off'}`} />
                  </button>
                </div>
                {walletEnabled ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={startingWallet}
                      onChange={e => setStartingWallet(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent outline-none text-white font-bold text-lg"
                      min="0"
                      id="wallet-amount"
                    />
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm">Optional</p>
                )}
              </div>
            </div>
          </div>

          {/* Players section */}
          <div className="p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
                Players <span className="text-indigo-400">{players.length}</span>/{MAX_PLAYERS}
              </p>
              <button
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
                id="add-player-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <span className="text-base leading-none">+</span> Add Player
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto -mr-1 pr-1">
              {players.map((player, i) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  index={i}
                  onNameChange={updateName}
                  onRemove={removePlayer}
                  canRemove={players.length > MIN_PLAYERS}
                />
              ))}
            </div>
          </div>

          {/* Start button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleStart}
              id="start-game-btn"
              className="btn-primary w-full text-base"
              style={{ borderRadius: '16px', padding: '16px' }}
            >
              Start Game →
            </button>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">No backend · All local · Open source vibe</p>
      </div>
    </div>
  );
}
