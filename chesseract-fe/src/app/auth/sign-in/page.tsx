"use client";

import React, { useState } from "react";
import signIn from "@/services/auth/signin";
import { validateEmail } from "@/utils/validators";
import { useToast } from "@/contexts/ToastContext";
import { setLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {showToast} = useToast();

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!validateEmail(email)) {
            setEmailError("Invalid email format");
            return;
        }

        setLoading(true);

        try {
            const response = await signIn({ email, password });
            if (response.success) {
                showToast("Sign-in successful!", "success");
                setLocalStorage("token", response.data?.token);
                setLocalStorage("user", response.data?.user);
                setLocalStorage("userId", response.data?.user._id);
                router.push("/home");
            } else {
                const error = response.error || "An error occurred";
                showToast(error, "error");
            }
        } catch (err) {
            console.error("Sign-in failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="bg-bg-200 border-1 border-accent-100 p-6 rounded-md shadow-md w-80"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
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
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border border-accent-100 rounded-md shadow-sm focus:ring-accent-200 focus:border-accent-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-2 text-white rounded-md mb-4 ${
                        loading
                            ? "bg-primary-200 cursor-not-allowed text-accent-200"
                            : "bg-primary-100 hover:bg-primary-200"
                    }`}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="text-center text-sm">
                    {"Don't have an account? "}
                    <Link href="/auth/sign-up" className="text-accent-200 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default SignIn;