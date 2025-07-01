'use client';
import InputField from "@/components/Data Models/input-field";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { useAuthStore } from "@/store/useAuthStore";
import AuthProviderBtn from "@/components/auth/authProviderButton";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
import LoginBtn from "@/components/auth/login-button";
import { LoginWithEmail } from "@/utils/authService";
import Image from "next/image";



export default () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const {setUser, user} = useAuthStore();

    console.log("user in login page", user);


    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
    }
    

    const handleLogin = async () => {
    setLoading(true);
    try {
        const userData = await LoginWithEmail(email, password);
        // Set a cookie to indicate authentication (expires in 7 days)
        document.cookie = `auth-user=true; path=/; max-age=${60 * 60 * 24 * 7}`;
        toast.success(
            `User logged in successfully!`,
        );
        router.push('/');
    } catch (err) {
        toast.error(err.message || 'Email or Password is incorrect..');
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="w-full h-screen flex flex-col items-center justify-center px-4 border-t-emberald-500 border-t-4">
            <div className="max-w-sm w-full text-gray-600">
                <div className="text-center flex flex-col justify-center items-center">
                    <Image width={100} height={100} src={'/icon.png'} alt="" />
                    <div className="mt-5 space-y-2">
                        <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Welcome back!</h3>
                    </div>
                </div>
                <form
                    className="mt-8 space-y-5"
                >
                    <InputField
                        label={"Email"}
                        type={"email"}
                        placeholder={""}
                        onChange={handleEmail}
                        value={email}
                        name="email"
                    />
                    <InputField
                        label={"Password"}
                        type={"password"}
                        placeholder={""}
                        onChange={handlePassword}
                        value={password}
                        name="password" // Corrected name to "password"
                    />
                    
                    <button
                        onClick={()=> handleLogin(email, password)} disabled={loading}
                        className="w-full px-4 py-2 text-white font-medium bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600 rounded-lg duration-150"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <AuthProviderBtn />
            </div>
            <ToastContainer />
        </main>
    );
}