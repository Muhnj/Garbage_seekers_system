// hooks/useCollectorData.ts
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useCollectorData() {
  const [collector, setCollector] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== 'collector') return;
    
    const q = query(collection(db, 'collectors'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCollector(snap.docs[0]?.data() || null);
    });

    return () => unsubscribe();
  }, [user]);

  return collector;
}