Got it! Now we have three shift types:

1. One-time → Scheduled on a specific date, doesn't repeat.


2. Daily → Happens every day at the same time.


3. Repeated → Happens on selected days (e.g., Monday, Wednesday, Friday).




---

Plan to Implement "Repeated" Shift Type

✅ Allow the admin to select specific days for repeated shifts (e.g., ["Monday", "Wednesday"]).
✅ Store these selected days in a new repeatDays array.
✅ When updating shifts, check if today is one of the repeat days before rescheduling.


---

Updated updateShiftStatus()

import { doc, updateDoc, addDoc, collection } from "firebase/firestore";

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
            if (shift.shiftType === "repeated" && shift.repeatDays) {
                const todayDay = currentDate.toLocaleString("en-US", { weekday: "long" });

                if (shift.repeatDays.includes(todayDay)) {
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


---

How It Works

✔ "Daily" shifts repeat every day.
✔ "One-time" shifts stay fixed.
✔ "Repeated" shifts only occur on selected days (e.g., "Monday", "Friday").


---

Next Steps

1. How will admins select the repeat days? Do you want a UI where they check boxes (e.g., Mon, Wed, Fri)?


2. Do you want to send reminders/notifications before a shift starts?


3. Should we use Firebase Cloud Functions to run this function automatically every night?



Let me know what features you want next! 🚀

