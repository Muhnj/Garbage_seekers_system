// hooks/useCollectorData.ts
import { db } from '@/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useCollectorData() {
  const [collectors, setCollectors] = useState([]); // You can replace any[] with a Collector type

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const q = query(
          collection(db, 'collectors'),
          where('status', '==', 'verified')
        );

        const snapshot = await getDocs(q);

        const verifiedCollectors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCollectors(verifiedCollectors);
      } catch (error) {
        console.error('Failed to fetch collectors:', error);
        return [];
      }
    };

    fetchCollectors();
  }, []);

  return collectors;
}
