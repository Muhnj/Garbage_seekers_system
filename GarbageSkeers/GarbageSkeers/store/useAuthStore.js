import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import { db } from '@/libs/firebase'; // adjust path as needed
import { doc, onSnapshot } from 'firebase/firestore';

const auth = getAuth();

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
      setLoading: (loading) => set({ loading }),
      unsubscribeAuth: null,
      unsubscribeUserDoc: null,
      // Call this once in your app (e.g. _app.js or root layout)
      initAuthListener: () => {
        // Clean up previous listeners if any
        if (get().unsubscribeAuth) get().unsubscribeAuth();
        if (get().unsubscribeUserDoc) get().unsubscribeUserDoc();

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            // Listen to user doc for deletion or changes
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
              if (!docSnap.exists()) {
                // User deleted in Firestore, log out
                get().logout();
              } else {
                set({ user: { uid: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() }, loading: false });
              }
            });
            set({ unsubscribeUserDoc });
          } else {
            set({ user: null, loading: false });
            if (get().unsubscribeUserDoc) get().unsubscribeUserDoc();
          }
        });
        set({ unsubscribeAuth });
      },
    }),
    {
      name: 'auth-store', // key in localStorage
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);

// In your app entry point, call useAuthStore.getState().initAuthListener() once to start listening.
