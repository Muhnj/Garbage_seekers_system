import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
  hasCompleted: boolean;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompleted: false,
      complete: () => set({ hasCompleted: true }),
      reset: () => set({ hasCompleted: false }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { hasCompleted, complete } = useOnboardingStore();
  
  if (!hasCompleted) {
    return <Onboarding slides={ONBOARDING_SLIDES} onComplete={complete} />;
  }
  
  return <>{children}</>;
}