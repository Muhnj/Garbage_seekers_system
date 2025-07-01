import { create } from "zustand";
import { db } from "@/libs/firebase";
import { collection, getDocs, onSnapshot, addDoc, query, doc, where, orderBy } from "firebase/firestore";


const useShiftStore = create((set, get) => ({
    
    collectorsID: [],
    clientID: '',
    location: '',
    shiftType: '',
    startTime: '',
    shiftDate: '',
    endTime: '',
    repeatedDays: [],
    status: '',
    shifts: [],


    setCollectorsID: (IDList) => set({collectorsID: IDList}),
    setClientID: (id) => set({clientID: id}),
    setLocation: (location = []) => set({location: location}),
    setShiftType: (type) => set({shiftType: type}),
    setStartTime: (time) => set({ startTime: time }),
    setEndTime: (time) => set({endTime: time}),
    setStartDate: (date) => set({ startDate: date }),
    setEndDate: (date) => set({endDate: date}),
    setRepeatedDays: (days) => set({ repeatedDays: days}),
    setStatus: (status) => set({ status }),
    resetShiftInfo: () => set({
        collectorsID: [],
        clientID: '',
        location: '',
        shiftType: '',
        startTime: '',
        endTime: '',
        repeatedDays: [],
        status: '',
    }),

    addShift: async (shift) => {
        try {
            const docRef = await addDoc(collection(db, "shifts"), shift);
            return docRef.id;
        } catch (error) {
            console.error(error.message);
            return null
        }
    },

    getShifts: async() =>{
        try {
            const shiftCollection = query(collection(db, 'shifts'), orderBy("atCreated"))
            const shiftSnapshot = await getDocs(shiftCollection);
            const shiftsList = shiftSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data()}));
            set({shifts: shiftsList})
            return shiftsList;
        } catch (error) {
            console.error(`unable to fetch shifts data: ${error.message}`)
            return [];
        }
    },

    subscribeToShifts: async () => {
        const shiftCollection = collection(db, 'shifts');
        return onSnapshot(shiftCollection, (snapshot) => {
            const shiftList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            set({ shifts: shiftList});
        });
    },

    getCollectorShifts: (id) => {
        const q = query(collection(db, 'shifts'), where("collectorID", "==", id));
        return onSnapshot(q, (snapshot) => {
            const collectorShifts = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

            set({shifts: collectorShifts})
        }); 
    },

    updateShiftStatus: async () => {
        const { getShifts } = get();
        const currentDate = new Date();
        const shifts = await getShifts();
    
        shifts.forEach(async (shift) => {
            const shiftDate = new Date(shift.shiftDate); // Date of occurrence
            const shiftStartTime = new Date(shiftDate);
            const shiftEndTime = new Date(shiftDate);
            shiftStartTime.setHours(...shift.startTime.split(":"));
            shiftEndTime.setHours(...shift.endTime.split(":"));
    
            let newStatus = shift.status;
    
            if (currentDate >= shiftStartTime && currentDate < shiftEndTime) {
                newStatus = "ongoing";
            } else if (currentDate >= shiftEndTime) {
                newStatus = "completed";
    
                // Reschedule daily shifts
                if (shift.shiftType === "daily") {
                    const nextDay = new Date();
                    nextDay.setDate(shiftDate.getDate() + 1);
    
                    await addDoc(collection(db, "shifts"), {
                        ...shift,
                        shiftDate: nextDay.toISOString().split("T")[0],
                        status: "pending",
                    });
                }
    
                // Reschedule repeated shifts (only on selected days)
                if (shift.shiftType === "repeated" && shift.repeatedDays) {
                    const todayDay = currentDate.toLocaleString("en-US", { weekday: "long" });
    
                    if (shift.repeatedDays.includes(todayDay)) {
                        const nextShiftDate = new Date();
                        nextShiftDate.setDate(currentDate.getDate() + 1); // Move to the next day
    
                        await addDoc(collection(db, "shifts"), {
                            ...shift,
                            shiftDate: nextShiftDate.toISOString().split("T")[0],
                            status: "pending",
                        });
                    }
                }
            } else {
                newStatus = "pending";
            }
    
            if (shift.status !== newStatus) {
                await updateDoc(doc(db, "shifts", shift.id), { status: newStatus });
            }
        });
    }
    

}))

export default useShiftStore;