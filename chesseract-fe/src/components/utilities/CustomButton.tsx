import React from 'react'

interface CustomButtonProps {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

const CustomButton = ({label="", onClick, disabled=false, className=""}:CustomButtonProps) => {
    return (
        <button
            onClick={() => {}}
            className={`p-2 cursor-pointer rounded-md hover:bg-primary-200 bg-primary-100 ${className}`}
            disabled={disabled}
        >
            {label}
        </button>
    )
}

export default CustomButton