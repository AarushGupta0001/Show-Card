import type { GameState, GameConfig, Player, PlayerRoundEntry, CardGroup, Round } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CARD_NUMERIC } from '../types';

export const STORAGE_KEY = 'show_cards_game_state';
export const HISTORY_KEY = 'show_cards_history';

export function createInitialDraftEntries(config: GameConfig): PlayerRoundEntry[] {
  return config.players.map((p) => ({
    playerId: p.id,
    groups: [{ id: uuidv4(), cards: [] }],
    doubleScore: false,
    score: 0,
    rawScore: 0,
  }));
}

export function createInitialGameState(config: GameConfig): GameState {
  return {
    screen: 'game',
    config,
    rounds: [],
    currentRound: 1,
    draftEntries: createInitialDraftEntries(config),
  };
}

export function computeGroupScore(group: CardGroup): number {
  return group.cards.reduce((sum, card) => sum + CARD_NUMERIC[card], 0);
}

export function computeRawScore(groups: CardGroup[]): number {
  return groups.reduce((sum, group) => sum + computeGroupScore(group), 0);
}

export function submitRound(state: GameState): GameState {
  const entries: PlayerRoundEntry[] = state.draftEntries.map((draft) => {
    const rawScore = computeRawScore(draft.groups);
    const score = draft.doubleScore ? rawScore * 2 : rawScore;
    return { ...draft, rawScore, score };
  });

  const newRound: Round = {
    roundNumber: state.currentRound,
    entries,
    submitted: true,
  };

  const rounds = [...state.rounds, newRound];
  const isLastRound = state.currentRound >= state.config.totalRounds;

  return {
    ...state,
    rounds,
    currentRound: isLastRound ? state.currentRound : state.currentRound + 1,
    draftEntries: createInitialDraftEntries(state.config),
    screen: isLastRound ? 'end' : 'game',
  };
}

export function getPlayerTotal(playerId: string, rounds: Round[]): number {
  return rounds
    .filter((r) => r.submitted)
    .reduce((sum, r) => {
      const entry = r.entries.find((e) => e.playerId === playerId);
      return sum + (entry?.score ?? 0);
    }, 0);
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

export function createPlayer(index: number): Player {
  return { id: uuidv4(), name: `Player ${index + 1}` };
}

export function exportCSV(state: GameState): void {
  const { config, rounds } = state;
  const headers = ['Player', ...rounds.map((r) => `Round ${r.roundNumber}`), 'Total'];
  const rows = config.players.map((p) => {
    const roundScores = rounds.map((r) => {
      const entry = r.entries.find((e) => e.playerId === p.id);
      return entry?.score ?? 0;
    });
    const total = getPlayerTotal(p.id, rounds);
    return [p.name, ...roundScores, total];
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'show_cards_scores.csv';
  a.click();
  URL.revokeObjectURL(url);
}
