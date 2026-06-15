import { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { getPlayerTotal, exportCSV } from '../utils/gameLogic';

function ConfettiPiece({ i }: { i: number }) {
  const colors = ['#6366f1','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#10b981'];
  const color  = colors[i % colors.length];
  const left   = `${(i * 37 + 5) % 100}%`;
  const delay  = `${(i * 0.13) % 2.5}s`;
  const dur    = `${2.5 + (i * 0.11) % 2}s`;
  const size   = `${6 + (i % 4) * 2}px`;

  return (
    <div
      className="absolute rounded-sm pointer-events-none"
      style={{
        left, top: '-10px', width: size, height: size,
        background: color, opacity: 0.8,
        animation: `confettiFall ${dur} linear ${delay} infinite`,
        transform: `rotate(${i * 30}deg)`,
      }}
    />
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm"
         style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {rank}
    </div>
  );
}

export default function EndScreen() {
  const { state, dispatch } = useGame();
  const { config, rounds }  = state;

  const ranked = useMemo(() =>
    config.players
      .map(p => ({ ...p, total: getPlayerTotal(p.id, rounds) }))
      .sort((a, b) => a.total - b.total)
      .map((p, i) => ({ ...p, rank: i + 1 })),
    [config.players, rounds]
  );

  const winner = ranked[0];
  const confetti = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="page-bg min-h-screen min-h-dvh relative overflow-hidden pb-12">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map(i => <ConfettiPiece key={i} i={i} />)}
      </div>

      {/* Subtle glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

      <div className="max-w-lg mx-auto px-4 pt-12 pb-8 relative z-10">

        {/* ── Winner hero ── */}
        <div className="text-center mb-8 anim-bounce-in">
          <div className="text-6xl mb-4 anim-float inline-block">🏆</div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white mb-2">Game Over</h1>
          <p className="text-slate-400 text-base">
            <span className="text-white font-bold">{winner?.name}</span>
            <span className="text-slate-600"> wins with </span>
            <span className="font-outfit font-black text-xl text-gradient">{winner?.total} pts</span>
          </p>
        </div>

        {/* ── Rankings card ── */}
        <div className="rounded-3xl overflow-hidden mb-4 anim-slide-up"
             style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-outfit font-bold text-base text-white">Final Rankings</h2>
          </div>

          <div className="divide-y" style={{ '--tw-divide-color': 'rgba(255,255,255,0.04)' } as React.CSSProperties}>
            {ranked.map((player, i) => {
              const avatarColor = `hsl(${(player.name.charCodeAt(0) * 23 + 220) % 360}, 55%, 42%)`;
              const isWinner    = player.rank === 1;

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors anim-slide-up"
                  style={{
                    background: isWinner ? 'rgba(245,158,11,0.05)' : 'transparent',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  <RankBadge rank={player.rank} />

                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                       style={{ background: avatarColor }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <span className={`flex-1 font-semibold truncate ${isWinner ? 'text-white text-base' : 'text-slate-300 text-sm'}`}>
                    {player.name}
                  </span>

                  <div className="text-right flex-shrink-0">
                    <div className={`font-outfit font-black ${
                      isWinner ? 'text-3xl text-gradient-gold' :
                      player.rank === 2 ? 'text-2xl text-slate-300' :
                      player.rank === 3 ? 'text-xl text-orange-400' :
                      'text-lg text-slate-500'
                    }`}>
                      {player.total}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{config.totalRounds}R</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Breakdown table ── */}
        <div className="rounded-3xl overflow-hidden mb-5 anim-slide-up"
             style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: '150ms' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-outfit font-semibold text-sm text-slate-400">Round Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-600 font-semibold">Player</th>
                  {rounds.map(r => (
                    <th key={r.roundNumber} className="px-3 py-2.5 text-center text-xs text-slate-600 font-semibold">R{r.roundNumber}</th>
                  ))}
                  <th className="px-4 py-2.5 text-center text-xs font-bold" style={{ color: 'var(--amber)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(player => (
                  <tr key={player.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-5 py-3">
                      <span className="text-white font-medium text-xs">{player.name}</span>
                    </td>
                    {rounds.map(r => {
                      const e = r.entries.find(e => e.playerId === player.id);
                      return (
                        <td key={r.roundNumber} className="px-3 py-3 text-center">
                          <span className={`text-xs font-semibold ${e?.score ? 'text-white' : 'text-slate-700'}`}>{e?.score ?? 0}</span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span className="font-outfit font-black text-sm text-gradient-gold">{player.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3 anim-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => exportCSV(state)}
            id="export-csv-btn"
            className="btn-ghost"
            style={{ padding: '14px', borderRadius: '14px', borderColor: 'rgba(16,185,129,0.25)', color: '#10b981' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1v10M4 7l4 4 4-4M2 13h12"/>
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => dispatch({ type: 'NEW_GAME' })}
            id="new-game-end-btn"
            className="btn-primary"
            style={{ padding: '14px', borderRadius: '14px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v5h5M15 12V7h-5"/><path d="M13.5 7A6 6 0 102.5 9.5"/>
            </svg>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
