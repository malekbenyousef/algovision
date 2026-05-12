import { create } from 'zustand';
export const useAlgoVisionStore = create((set) => ({
    history: [],
    currentIndex: -1,
    variables: [],
    previousVariables: [],
    pushSnapshot: (vars) => {
        set((state) => {
            // If we are not at the latest snapshot, truncate the future history
            const newHistory = state.history.slice(0, state.currentIndex + 1);
            newHistory.push(vars);
            return {
                history: newHistory,
                currentIndex: newHistory.length - 1,
                variables: vars,
                // If it's the first snapshot, previousVariables is empty, otherwise it's the previous one
                previousVariables: newHistory.length > 1 ? newHistory[newHistory.length - 2] : [],
            };
        });
    },
    stepBack: () => {
        set((state) => {
            if (state.currentIndex <= 0)
                return state; // Can't step back past the first state
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
            if (state.currentIndex >= state.history.length - 1)
                return state; // Can't step forward past the latest
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
        });
    },
}));
//# sourceMappingURL=useAlgoVisionStore.js.map