"use client";

import React, { useState } from "react";
import signUp from "@/services/auth/signup";
import { validateEmail } from "@/utils/validators";
import { useToast } from "@/contexts/ToastContext";
import { setLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <div className="flex items-center justify-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="bg-bg-200 border-1 border-accent-100 p-6 rounded-md shadow-md w-96"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                
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
                    className={`w-full p-2 text-white rounded-md ${
                        loading
                            ? "bg-primary-200 cursor-not-allowed text-accent-200"
                            : "bg-primary-100 hover:bg-primary-200"
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
    );
};

export default SignUp;