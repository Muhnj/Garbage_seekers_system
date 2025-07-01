import { db } from "./firebase";
import { addDoc, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export const getGuards = async () => {
    try {
        // Step 1: Create a query snapshot
        const querySnapshot = await getDocs(collection(db, "guards"));

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

    } catch (error) {
        console.error("Error fetching guards: ", error);
        return [];
    }
}

export const addOfficer = async (collectorInfo) => {
    try {
        await addDoc(collection(db, "guards"), collectorInfo);
        console.log("New collector created successfully");
    } catch (err) {
        console.log(err.message);
    }
}

// New function to update an collector
export const updateOfficer = async (id, updatedInfo) => {
    try {
        const collectorRef = doc(db, "guards", id); // Create a reference to the collector document
        await updateDoc(collectorRef, updatedInfo); // Update the document with the new data
        console.log("Officer updated successfully");
    } catch (err) {
        console.error("Error updating collector: ", err);
    }
}