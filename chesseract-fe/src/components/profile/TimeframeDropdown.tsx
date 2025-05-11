import { TimeFrame } from "@/models/GameUtilityTypes";
import { useState, useRef, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";

interface TimeframeDropdownProps {
    onSelect: (timeframe: TimeFrame) => void;
    selectedTimeframe?: TimeFrame;
}

const timeframeOptions: { value: TimeFrame; label: string }[] = [
    { value: "1w", label: "Last 7 days" },
    { value: "1m", label: "Last 30 days" },
    { value: "3m", label: "Last 90 days" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last 12 months" }
];

const TimeframeDropdown = ({ onSelect, selectedTimeframe = "1m" }: TimeframeDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find the label for the currently selected timeframe
    const selectedLabel = timeframeOptions.find(option => option.value === selectedTimeframe)?.label || "Timeframe";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: TimeFrame) => {
        onSelect(value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="flex items-center justify-between px-4 py-2 bg-bg-200 text-text-200 rounded-md w-40 hover:bg-bg-300 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="text-sm">{selectedLabel}</span>
                <IoMdArrowDropdown 
                    className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>

            {isOpen && (
                <div className="absolute mt-1 w-full bg-bg-100 border border-bg-300 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        {timeframeOptions.map((option) => (
                            <li key={option.value}>
                                <button
                                    className={`block w-full text-left px-4 py-2 hover:bg-bg-200 ${
                                        selectedTimeframe === option.value ? 'text-accent-200 font-medium' : 'text-text-200'
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TimeframeDropdown;