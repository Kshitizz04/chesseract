import React from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";

interface ResultModalProps {
    result: 0 | 1 | 2; // 0 = lost, 1 = won, 2 = drawn
    message: string; // Reason for the result
    onClose: () => void; // Callback to close the modal
}

const ResultModal = ({ result, message, onClose }: ResultModalProps) => {
    const getTitle = () => {
        switch (result) {
            case 0:
                return "You Lost";
            case 1:
                return "You Won";
            case 2:
                return "Game Drawn";
            default:
                return "";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 text-text-color">
            <div className="relative bg-glass-bg/50 rounded-md shadow-sm shadow-shadow-color w-96 h-96 text-center p-6 pt-12">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 bg-button hover:bg-button-hover rounded-full transition duration-200 cursor-pointer"
                    aria-label="Close Modal"
                >
                    <IoIosCloseCircleOutline size={30}/>
                </button>

                {/* Modal Content */}
                <h2 className="text-2xl font-bold mb-4">{getTitle()}</h2>
                <p className="mb-6">{message}</p>
            </div>
        </div>
    );
};

export default ResultModal;