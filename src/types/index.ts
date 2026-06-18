
export type CardValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export const CARD_NUMERIC: Record<CardValue, number> = {
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13,
};

export const ALL_CARDS: CardValue[] = ['1','2','3','4','5','6','7','8','9','10','J','Q','K'];

export interface CardGroup {
  id: string;
  cards: CardValue[];
}

export interface PlayerRoundEntry {
  playerId: string;
  role?: 'show' | 'others';
  /** groups of cards (normal mode = 1 group, collection = multiple) */
  groups: CardGroup[];
  doubleScore: boolean;
  /** computed score after submission */
  score: number;
  /** raw score before doubling */
  rawScore: number;
}

export interface Round {
  roundNumber: number;
  entries: PlayerRoundEntry[];
  submitted: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface GameConfig {
  players: Player[];
  totalRounds: number;
  startingWallet?: number;
}

export type GameScreen = 'setup' | 'game' | 'end';

export interface GameState {
  screen: GameScreen;
  config: GameConfig;
  rounds: Round[];
  currentRound: number;
  /** Draft entries for the current round (not yet submitted) */
  draftEntries: PlayerRoundEntry[];
}

export interface HistoryEntry {
  state: GameState;
}
