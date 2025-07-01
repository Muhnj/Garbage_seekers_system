// hooks/useLocalGovernorData.ts
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useLocalGovernorData() {
  const [governor, setGovernor] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== 'local_governor') return;
    
    const q = query(collection(db, 'local_governors'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setGovernor(snap.docs[0]?.data() || null);
    });

    return () => unsubscribe();
  }, [user]);

  return governor;
}