"use client";

import React, { useState } from "react";
import signUp from "@/services/auth/signup";
import { validateEmail } from "@/utils/validators";
import { useToast } from "@/contexts/ToastContext";
import { setLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import bgImage from "@/assets/auth-desk-bg.png";
import bgImagePhone from "@/assets/auth-phone-bg.png";
import LogoTextSvg from "@/assets/LogoTextSvg";
import Image from "next/image";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {showToast} = useToast();

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset errors
        setEmailError(null);
        setPasswordError(null);
        setUsernameError(null);
        
        // Validate inputs
        let isValid = true;
        
        if (!username || username.length < 3) {
            setUsernameError("Username must be at least 3 characters");
            isValid = false;
        }

        if (!validateEmail(email)) {
            setEmailError("Invalid email format");
            isValid = false;
        }
        
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            setPasswordError("Passwords don't match");
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);

        try {
            const response = await signUp({ username, email, password });
            console.log("Response:", response);
            if (response.success) {
                showToast("Account created successfully!", "success");
                setLocalStorage("token", response.data?.token);
                setLocalStorage("user", response.data?.user);
                setLocalStorage("userId", response.data?.user._id);
                router.push("/home");
            } else {
                const error = response.error || "An error occurred";
                showToast(error, "error");
            }
        } catch (err) {
            console.error("Sign-up failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex justify-between md:justify-start h-screen">
            <div
                className="hidden md:block relative w-3/5 h-full"
            >
                <Image
                    src={bgImage.src}
                    alt="Background"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
            </div>

            <div
                className="block md:hidden absolute inset-0 bg-cover bg-center  pointer-events-none"
            >
                <Image
                    src={bgImagePhone.src}
                    alt="Background"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
            </div>

            <div className="relative w-full md:w-2/5 bg-bg-100/70 md:bg-bg-100 flex flex-col items-center justify-center p-2">
                <div className="absolute top-0 left-0 flex flex-col justify-start w-max m-4">
                    <LogoTextSvg id="sign-in" className="w-1/2" />
                    <p className="gradient-text">Think Inside The Chesseract</p>
                </div>

                <div className="flex flex-col justify-start w-max mb-4">
                    <h1 className="text-2xl font-bold">WELCOME</h1>
                    <p>Sign up to start your journey</p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="p-6 rounded-md shadow-md w-80"
                >
                    
                    {/* Username field */}
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => {setUsername(e.target.value); setUsernameError(null)}}
                            className="mt-1 block w-full p-2 border border-accent-100 rounded-md shadow-sm focus:ring-accent-200 focus:border-accent-200"
                            required
                        />
                        {usernameError && (
                            <div className="text-red-500 text-sm mt-1">
                                {usernameError}
                            </div>
                        )}
                    </div>
                    
                    {/* Email field */}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {setEmail(e.target.value); setEmailError(null)}}
                            className="mt-1 block w-full p-2 border border-accent-100 rounded-md shadow-sm focus:ring-accent-200 focus:border-accent-200"
                            required
                        />
                        {emailError && (
                            <div className="text-red-500 text-sm mt-1">
                                {emailError}
                            </div>
                        )}
                    </div>
                    
                    {/* Password field */}
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => {setPassword(e.target.value); setPasswordError(null)}}
                            className="mt-1 block w-full p-2 border border-accent-100 rounded-md shadow-sm focus:ring-accent-200 focus:border-accent-200"
                            required
                        />
                    </div>
                    
                    {/* Confirm Password field */}
                    <div className="mb-4">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {setConfirmPassword(e.target.value); setPasswordError(null)}}
                            className="mt-1 block w-full p-2 border border-accent-100 rounded-md shadow-sm focus:ring-accent-200 focus:border-accent-200"
                            required
                        />
                        {passwordError && (
                            <div className="text-red-500 text-sm mt-1">
                                {passwordError}
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 text-accent-200 rounded-md ${
                            loading
                                ? "bg-bg-300 cursor-not-allowed"
                                : "bg-bg-200 hover:bg-bg-300"
                        } mb-4`}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                    
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/sign-in" className="text-accent-200 hover:underline">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;