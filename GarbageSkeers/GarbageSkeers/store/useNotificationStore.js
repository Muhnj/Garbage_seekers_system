import { create } from 'zustand'
import { db } from '@/libs/firebase'
import { query, collection, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export const useNotificationStore = create((set) => ({
    users: [],
    subscribeToNewUsers: () => {
        const getUsers = query(collection(db, 'collectors'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(getUsers, (snapshot) => {
            const newUsers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            set({users: newUsers});
        });

        return unsubscribe;
    },

    // Mark notification as read
    markAsRead: async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { isRead: true });

        // Update Zustand state
        set((state) => ({
            users: state.users.map((user) =>
                user.id === userId ? { ...user, isRead: true } : user
            ),
        }));
    },
}));