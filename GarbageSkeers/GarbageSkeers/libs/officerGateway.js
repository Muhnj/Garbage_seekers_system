import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

//Get all collector in the database
export const getCollectors = async () => {
    try {
        //Step 1: Create a query snapshot
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

//Get specific collector provided the id
export const getCollector = async (id) => {
    try {
        const collectorRef = doc(db, 'guards', id);
        const collector = await getDoc(collectorRef);

        if(collector.exists){
            const collectorDetails = {id: collector.id, ...collector.data()}
            return collectorDetails;
        }else{
            console.error("Officer doesnt exit");
        }
    } catch (error) {
        console.error("Something went wrong: ", error.message);
    }
}

//Delete an collector provide his id
export const deleteOffice = async (id) => {
    await deleteDoc(doc(db, "guards", id));
    return;
}




