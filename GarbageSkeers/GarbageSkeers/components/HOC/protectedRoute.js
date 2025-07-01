'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/libs/firebase";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // Redirect to login if not logged in
        return;
      }

      // Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        setUserRole(role);

        // Redirect if the role doesn't match
        if (requiredRole && role !== requiredRole) {
          router.push("/unauthorized"); // Redirect unauthorized users
        }
      } else {
        console.error("User role not found in database");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, requiredRole]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
};

export default ProtectedRoute;
