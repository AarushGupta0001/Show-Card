import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameConfig, PlayerRoundEntry, CardValue } from '../types';
import {
  createInitialGameState,
  submitRound,
  saveState,
  clearState,
  computeRawScore,
  computeGroupScore,
} from '../utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

// ──────────────────────────────── Types ────────────────────────────────
export type Action =
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'NEW_GAME' }
  | { type: 'RESTORE_GAME'; state: GameState }
  | { type: 'SUBMIT_ROUND' }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_DOUBLE'; playerId: string }
  | { type: 'ADD_CARD'; playerId: string; groupId: string; card: CardValue }
  | { type: 'REMOVE_LAST_CARD'; playerId: string; groupId: string }
  | { type: 'ADD_GROUP'; playerId: string }
  | { type: 'REMOVE_GROUP'; playerId: string; groupId: string }
  | { type: 'EDIT_ROUND'; roundIndex: number }
  | { type: 'UPDATE_PLAYER_NAME'; playerId: string; name: string }
  | { type: 'SET_ROLE'; playerId: string; role: 'show' | 'others' };

interface GameContextValue {
  state: GameState;
  dispatch: (action: Action) => void;
  canUndo: boolean;
  getDraftEntry: (playerId: string) => PlayerRoundEntry | undefined;
  getDraftGroupScore: (playerId: string, groupId: string) => number;
  getDraftTotalScore: (playerId: string) => number;
}

// ──────────────────────────────── Context ────────────────────────────────
const GameContext = React.createContext<GameContextValue | null>(null);

const EMPTY_STATE: GameState = {
  screen: 'setup',
  config: { players: [], totalRounds: 5 },
  rounds: [],
  currentRound: 1,
  draftEntries: [],
};

// ──────────────────────────────── Pure state transitions ────────────────
function applyAction(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createInitialGameState(action.config);

    case 'NEW_GAME':
      clearState();
      return EMPTY_STATE;

    case 'RESTORE_GAME':
      return action.state;

    case 'SUBMIT_ROUND':
      return submitRound(state);

    case 'TOGGLE_DOUBLE':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) =>
          e.playerId === action.playerId ? { ...e, doubleScore: !e.doubleScore } : e
        ),
      };

    case 'ADD_CARD':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) => {
          if (e.playerId !== action.playerId) return e;
          return {
            ...e,
            groups: e.groups.map((g) =>
              g.id === action.groupId
                ? { ...g, cards: [...g.cards, action.card] }
                : g
            ),
          };
        }),
      };

    case 'REMOVE_LAST_CARD':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) => {
          if (e.playerId !== action.playerId) return e;
          return {
            ...e,
            groups: e.groups.map((g) =>
              g.id === action.groupId
                ? { ...g, cards: g.cards.slice(0, -1) }
                : g
            ),
          };
        }),
      };

    case 'ADD_GROUP':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) => {
          if (e.playerId !== action.playerId) return e;
          return {
            ...e,
            groups: [...e.groups, { id: uuidv4(), cards: [] }],
          };
        }),
      };

    case 'REMOVE_GROUP':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) => {
          if (e.playerId !== action.playerId) return e;
          if (e.groups.length <= 1) return e;
          return {
            ...e,
            groups: e.groups.filter((g) => g.id !== action.groupId),
          };
        }),
      };

    case 'EDIT_ROUND': {
      const round = state.rounds[action.roundIndex];
      if (!round) return state;
      const newRounds = state.rounds.slice(0, action.roundIndex);
      return {
        ...state,
        screen: 'game',
        rounds: newRounds,
        currentRound: round.roundNumber,
        draftEntries: round.entries.map((e) => ({
          ...e,
          groups: e.groups.length > 0 ? e.groups : [{ id: uuidv4(), cards: [] }],
        })),
      };
    }

    case 'UPDATE_PLAYER_NAME':
      return {
        ...state,
        config: {
          ...state.config,
          players: state.config.players.map((p) =>
            p.id === action.playerId ? { ...p, name: action.name } : p
          ),
        },
      };

    case 'SET_ROLE':
      return {
        ...state,
        draftEntries: state.draftEntries.map((e) =>
          e.playerId === action.playerId ? { ...e, role: action.role } : e
        ),
      };

    default:
      return state;
  }
}

// ──────────────────────────────── Provider ────────────────────────────────
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [canUndo, setCanUndo] = useState(false);
  const historyRef = useRef<GameState[]>([]);

  // Persist state changes
  useEffect(() => {
    if (state.screen !== 'setup') {
      saveState(state);
    }
  }, [state]);

  const dispatch = useCallback((action: Action) => {
    if (action.type === 'UNDO') {
      const history = historyRef.current;
      if (history.length === 0) return;
      const prev = history[history.length - 1];
      historyRef.current = history.slice(0, -1);
      setCanUndo(historyRef.current.length > 0);
      setState(prev);
      return;
    }

    setState((current) => {
      if (action.type !== 'RESTORE_GAME') {
        historyRef.current = [...historyRef.current, current];
        if (historyRef.current.length > 50) {
          historyRef.current = historyRef.current.slice(-50);
        }
      }
      return applyAction(current, action);
    });
    if (action.type !== 'RESTORE_GAME') {
      setCanUndo(true);
    }
  }, []);

  const getDraftEntry = useCallback(
    (playerId: string) => state.draftEntries.find((e) => e.playerId === playerId),
    [state.draftEntries]
  );

  const getDraftGroupScore = useCallback(
    (playerId: string, groupId: string) => {
      const entry = state.draftEntries.find((e) => e.playerId === playerId);
      if (!entry) return 0;
      const group = entry.groups.find((g) => g.id === groupId);
      if (!group) return 0;
      return computeGroupScore(group);
    },
    [state.draftEntries]
  );

  const getDraftTotalScore = useCallback(
    (playerId: string) => {
      const entry = state.draftEntries.find((e) => e.playerId === playerId);
      if (!entry) return 0;
      const raw = computeRawScore(entry.groups);
      return entry.doubleScore ? raw * 2 : raw;
    },
    [state.draftEntries]
  );

  return (
    <GameContext.Provider
      value={{ state, dispatch, canUndo, getDraftEntry, getDraftGroupScore, getDraftTotalScore }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ──────────────────────────────── Hook ────────────────────────────────
export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
