'use client';

import { useEffect, useRef } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes

const useAutoLogout = () => {
  const auth = getAuth();
  const logoutTimer = useRef(null); // Use a ref to persist the timer
  const router = useRouter();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = setTimeout(() => {
        signOut(auth)
          .then(() => {
            console.log("User  automatically logged out due to inactivity.");
            router.push("/login"); // Use Next.js router for navigation
          })
          .catch((error) => {
            console.error("Error during sign out:", error);
          });
      }, AUTO_LOGOUT_TIME);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    // Start the timer
    resetTimer();

    return () => {
      clearTimeout(logoutTimer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [auth, router]); // Add auth and router to the dependency array
};

export default useAutoLogout;