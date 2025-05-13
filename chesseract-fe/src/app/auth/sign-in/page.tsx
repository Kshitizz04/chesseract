"use client";

import React, { useState } from "react";
import signIn from "@/services/auth/signin";
import { validateEmail } from "@/utils/validators";
import { useToast } from "@/contexts/ToastContext";
import { setLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import bgImage from "@/assets/auth-desk-bg.png";
import bgImagePhone from "@/assets/auth-phone-bg.png";
import LogoTextSvg from "@/assets/LogoTextSvg";
import Image from "next/image";

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
        <div className="flex justify-between md:justify-start h-screen">
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

            {/* <div
                className="block md:hidden absolute inset-0 bg-cover bg-center  pointer-events-none"
                style={{
                    backgroundImage: `url(${bgImagePhone.src})`,
                    opacity: 0.3,
                    zIndex: -1,
                }}
            /> */}
            <div className="relative w-full md:w-2/5 flex flex-col items-center justify-center p-2 bg-bg-100/70 md:bg-bg-100">
                <div className="absolute top-0 left-0 flex flex-col justify-start w-max m-4">
                    <LogoTextSvg id="sign-in" className="w-1/2" />
                    <p className="gradient-text">Think Inside The Chesseract</p>
                </div>

                <div className="flex flex-col justify-start w-max mb-4">
                    <h1 className="text-2xl font-bold">WELCOME BACK</h1>
                    <p>Welcome back! Please enter your details</p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="p-6 rounded-md shadow-md w-80 "
                >
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
                        className={`w-full p-2 text-accent-200 rounded-md mb-4 ${
                            loading
                                ? "bg-bg-300 cursor-not-allowed"
                                : "bg-bg-200 hover:bg-bg-300"
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
        </div>
    );
};

export default SignIn;