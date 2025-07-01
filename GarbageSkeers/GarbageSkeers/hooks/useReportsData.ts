// hooks/useIssueReportsData.ts
import { db } from '@/firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useIssueReportsData() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'issue_reports'), (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return reports;
}