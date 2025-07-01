import { db } from "./firebase";
import {getDocs, collection} from 'firebase/firestore'

export const getResidents = async () => {
    try {
        const querySnapshoot = await getDocs(collection(db, "clients"));

        return querySnapshoot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Failed to fetch Residents:", error)
        return [];
    }
}