import { create } from 'zustand'

export const useFilterStore = create((set) => ({
    pickupFilter: 'All',
    setPickupFilter: (keyword) => set({ pickupFilter: keyword}),
}))