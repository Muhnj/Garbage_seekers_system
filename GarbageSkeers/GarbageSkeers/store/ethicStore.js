import { create } from 'zustand';

export const useEthics = create((set, get) => ({
    loading: false,
    startLoading: () => set(() => ({loading: true})),
    stopLoading: () => set(() => ({loading: false})),
    toggleLoading: () => set((state) => ({loading: !state.loading}))
}));