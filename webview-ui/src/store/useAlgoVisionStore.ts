import { create } from 'zustand';

export interface EnrichedVariable {
  kind: string;
  name: string;
  value?: any;
  [key: string]: any;
}

interface AlgoVisionStore {
  // History
  history: EnrichedVariable[][];
  currentIndex: number;

  // Derived from history
  variables: EnrichedVariable[];
  previousVariables: EnrichedVariable[];

  // Playback & UI State
  isPlaying: boolean;
  playbackSpeedMs: number;
  status: 'idle' | 'fetching' | 'error';
  hasData: boolean;

  // Actions
  pushSnapshot: (vars: EnrichedVariable[]) => void;
  stepBack: () => void;
  stepForward: () => void;
  resetHistory: () => void;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  setSpeedMs: (ms: number) => void;
  setStatus: (status: 'idle' | 'fetching' | 'error') => void;
  setHasData: (hasData: boolean) => void;
}

export const useAlgoVisionStore = create<AlgoVisionStore>((set) => ({
  history: [],
  currentIndex: -1,
  variables: [],
  previousVariables: [],

  isPlaying: false,
  playbackSpeedMs: 400,
  status: 'idle',
  hasData: false,

  pushSnapshot: (vars) => {
    set((state) => {
      // If we are not at the latest snapshot and we receive new data, truncate future
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(vars);
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
        variables: vars,
        previousVariables: newHistory.length > 1 ? newHistory[newHistory.length - 2] : [],
      };
    });
  },

  stepBack: () => {
    set((state) => {
      if (state.currentIndex <= 0) return state;
      const newIndex = state.currentIndex - 1;
      return {
        currentIndex: newIndex,
        variables: state.history[newIndex],
        previousVariables: newIndex > 0 ? state.history[newIndex - 1] : [],
      };
    });
  },

  stepForward: () => {
    set((state) => {
      if (state.currentIndex >= state.history.length - 1) return state;
      const newIndex = state.currentIndex + 1;
      return {
        currentIndex: newIndex,
        variables: state.history[newIndex],
        previousVariables: state.history[newIndex - 1],
      };
    });
  },

  resetHistory: () => {
    set({
      history: [],
      currentIndex: -1,
      variables: [],
      previousVariables: [],
      isPlaying: false,
      status: 'idle',
      hasData: false,
    });
  },

  setIsPlaying: (playing) => set((state) => ({ 
    isPlaying: typeof playing === 'function' ? playing(state.isPlaying) : playing 
  })),
  setSpeedMs: (ms) => set({ playbackSpeedMs: ms }),
  setStatus: (status) => set({ status }),
  setHasData: (hasData) => set({ hasData }),
}));