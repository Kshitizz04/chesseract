import React from "react";
import CustomModal from "./CustomModal";
import CustomButton from "../utilities/CustomButton";

interface ResultModalProps {
    result: 0 | 1 | 2; // 0 = lost, 1 = won, 2 = drawn
    message: string; // Reason for the result
    onClose: () => void; // Callback to close the modal
}

const ResultModal = ({ result, message, onClose }: ResultModalProps) => {
    const getTitle = () => {
        console.log("Result:", result);
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
        <CustomModal onClose={onClose}>
            <div className="w-full h-full flex flex-col items-center justify-between px-2">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">{getTitle()}</h2>
                    <p className="mb-6">{message}</p>
                </div>
                <CustomButton
                    onClick={()=>{}}
                    className="m-2 bg-bg-100"
                >
                    Play Again
                </CustomButton>
            </div>
        </CustomModal>
    );
};

export default ResultModal;