// hooks/usePickupsData.ts
import { db } from '@/firebase/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function usePickupsData(status?: 'pending' | 'completed') {
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    let q = collection(db, 'pickups');
    if (status) q = query(q, where('status', '==', status));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setPickups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [status]);

  return pickups;
}