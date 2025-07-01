import { create } from "zustand";

export const useFeedback = create({
    errorMsg: null,
    successMssg: null,
    
    setError: (error) => set({errorMsg: error}),
    setSuccess: (success) => set({ successMssg: success})
});