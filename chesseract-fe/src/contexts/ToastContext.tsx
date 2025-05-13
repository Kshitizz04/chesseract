"use client"
import React, { createContext, useContext, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline, MdInfoOutline } from "react-icons/md";

type ToastType = "success" | "error" | "info";

interface ToastContextProps {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
        message: "",
        type: "info",
        visible: false,
    });

    const showToast = (message: string, type: ToastType = "info") => {
        setToast({ message, type, visible: true });

        // Auto-dismiss the toast after 3 seconds
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast.visible && (
                <div className="fixed top-4 right-4 p-4 rounded-md shadow-md bg-primary-100 flex items-center gap-3 z-30">
                    {/* Icon */}
                    {toast.type === "success" && (
                        <IoMdCheckmarkCircleOutline className="text-green-500" size={24} />
                    )}
                    {toast.type === "error" && (
                        <MdErrorOutline className="text-red-500" size={24} />
                    )}
                    {toast.type === "info" && (
                        <MdInfoOutline className="text-blue-500" size={24} />
                    )}

                    {/* Message */}
                    <span className={`flex-1 font-medium text-${toast.type === "success" ? "green-500" : toast.type === "error" ? "red-500" : "blue-500"}`}>
                        {toast.message}
                    </span>

                    {/* Close Button */}
                    <button
                        onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                        className="text-accent-100 hover:text-accent-200"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};