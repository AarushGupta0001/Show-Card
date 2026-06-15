import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';
import Leaderboard from '../components/Leaderboard';

export default function GameScreen() {
  const { state, dispatch, canUndo } = useGame();
  const { currentRound, config }    = state;
  const totalRounds = config.totalRounds;
  const progressPct = ((currentRound - 1) / totalRounds) * 100;

  const handleSubmit  = () => dispatch({ type: 'SUBMIT_ROUND' });
  const handleUndo    = () => dispatch({ type: 'UNDO' });
  const handleNewGame = () => {
    if (window.confirm('Start a new game? Current progress will be lost.')) {
      dispatch({ type: 'NEW_GAME' });
    }
  };

  return (
    <div className="page-bg min-h-screen min-h-dvh pb-8">

      {/* ── Sticky Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-40"
              style={{ background: 'rgba(13,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🃏</div>
            <div>
              <p className="font-outfit font-black text-sm text-gradient leading-none">Show Cards</p>
              <p className="text-slate-600 text-[11px] leading-none mt-0.5">
                Round <span className="text-indigo-400 font-bold">{currentRound}</span> / {totalRounds}
              </p>
            </div>
          </div>

          {/* Progress bar — desktop only */}
          <div className="hidden sm:flex flex-col gap-1 w-28">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
            </div>
            <span className="text-[10px] text-slate-600 text-right">{Math.round(progressPct)}%</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              id="undo-btn"
              className="btn-ghost text-xs px-3 py-2"
              style={{ gap: '4px' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4h7a3 3 0 010 6H5M1 4l3-3M1 4l3 3"/>
              </svg>
              Undo
            </button>
            <button
              onClick={handleNewGame}
              id="new-game-header-btn"
              className="btn-ghost text-xs px-3 py-2"
              style={{ borderColor: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)', gap: '4px' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 2L2 10M2 2l8 8"/>
              </svg>
              New
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-5">

        {/* Round badge */}
        <div className="anim-slide-down flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 4px 24px rgba(99,102,241,0.1)' }}>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Round</span>
            </div>
            <span className="font-outfit font-black text-4xl text-gradient leading-none">{currentRound}</span>
            <div className="flex flex-col">
              <span className="text-slate-600 text-xs font-medium">of {totalRounds}</span>
            </div>

            {/* Mobile progress dots */}
            <div className="sm:hidden flex items-center gap-1 ml-2">
              {Array.from({ length: totalRounds }, (_, i) => (
                <div key={i} className="rounded-full transition-all duration-500"
                     style={{
                       width: i < currentRound - 1 ? '8px' : '6px',
                       height: i < currentRound - 1 ? '8px' : '6px',
                       background: i < currentRound - 1
                         ? '#6366f1'
                         : i === currentRound - 1
                         ? 'rgba(99,102,241,0.5)'
                         : 'rgba(255,255,255,0.07)',
                     }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Player grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 anim-slide-up">
          {config.players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {/* ── Submit button ── */}
        <div className="anim-slide-up" style={{ animationDelay: '80ms' }}>
          <button
            onClick={handleSubmit}
            id="submit-round-btn"
            className="btn-primary w-full"
            style={{
              borderRadius: '18px',
              padding: '18px',
              fontSize: '16px',
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
            }}
          >
            Submit Round {currentRound}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h12M10 4l5 5-5 5"/>
            </svg>
          </button>
        </div>

        {/* ── Leaderboard ── */}
        <div className="anim-slide-up" style={{ animationDelay: '120ms' }}>
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
