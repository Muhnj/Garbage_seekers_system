// hooks/useResidentData.ts
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';


export function useResidentData() {
  const [resident, setResident] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== 'resident') return;
    
    const q = query(collection(db, 'residents'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setResident(snap.docs[0]?.data() || null);
    });

    return () => unsubscribe();
  }, [user]);

  return resident;
}