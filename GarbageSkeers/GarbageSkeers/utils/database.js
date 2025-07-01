import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Function to add data
export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    return docRef.id; // Returns the document ID
  } catch (error) {
    console.error("Error adding document: ", error);
    return null;
  }
};

// Function to get data
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return [];
  }
};
