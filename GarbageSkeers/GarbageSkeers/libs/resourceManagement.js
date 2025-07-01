import { db } from '@/libs/firebase';
import {
    getDoc,
    doc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc
} from 'firebase/firestore';

class ResourceManager {
    constructor(collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }

    // Private helper methods
    _collectionRef() {
        return collection(this.db, this.collectionName);
    }

    _docRef(id) {
        return doc(this.db, this.collectionName, id);
    }

    // Get all documents
    async getAll() {
        try {
            const snapshot = await getDocs(this._collectionRef());
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`❌ Failed to fetch documents from '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Get a single document by ID
    async get(id) {
        try {
            const docSnap = await getDoc(this._docRef(id));
            if (!docSnap.exists()) throw new Error("Document not found");
            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error(`❌ Failed to fetch document '${id}' from '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Add a new document
    async addResource(resource) {
        try {
            const docRef = await addDoc(this._collectionRef(), {
                ...resource,
                createdAt: new Date()
            });
            console.log(`✅ Document added to '${this.collectionName}' with ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error(`❌ Failed to add document to '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Update an existing document
    async updateResource(id, updatedData) {
        try {
            await updateDoc(this._docRef(id), updatedData);
            console.log(`✅ Document '${id}' updated in '${this.collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to update document '${id}' in '${this.collectionName}':`, error);
            throw error;
        }
    }

    // Delete a document
    async deleteResource(id) {
        try {
            await deleteDoc(this._docRef(id));
            console.log(`🗑️ Document '${id}' deleted from '${this.collectionName}'`);
        } catch (error) {
            console.error(`❌ Failed to delete document '${id}' from '${this.collectionName}':`, error);
            throw error;
        }
    }
}

// 🔧 Instantiate managers for each collection
export const pickupsManager = new ResourceManager('pickups');
export const collectorManager = new ResourceManager('collectors');
export const userManager = new ResourceManager('users');
export const reviewManager = new ResourceManager('incidents');