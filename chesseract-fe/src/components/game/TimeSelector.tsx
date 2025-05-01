import { TimeFormats } from "@/models/GameUtilityTypes";
import Button from "../utilities/CustomButton";
import { SiStackblitz } from "react-icons/si";
import { JSX, useState } from "react";
import { GiBulletBill } from "react-icons/gi";
import { IoTimerOutline } from "react-icons/io5";
import { useToast } from '@/contexts/ToastContext';

interface TimeSelectorProps {
    setTime: (type:"bullet" | "blitz" | "rapid", time: string) => void;
    selectedTime: string;
}

function TimeSelector({selectedTime, setTime}: TimeSelectorProps) {
    const [customInitial, setCustomInitial] = useState<string>("");
    const [customIncrement, setCustomIncrement] = useState<string>("");
    const {showToast} = useToast();

    const timeArray: {type: TimeFormats, times:string[], icon: JSX.Element}[] = [
        {type: "bullet", times: ["1|0", "2|0", "3|0"], icon: <GiBulletBill />},
        {type: "blitz", times: ["3|2", "5|0", "5|3"], icon: <SiStackblitz />},
        {type: "rapid", times: ["10|0", "10|5", "15|0"], icon: <IoTimerOutline />},
    ]

    const determineTimeFormat = (initial: number): "bullet" | "blitz" | "rapid" => {
        if (initial < 2) return "bullet";
        if (initial < 10) return "blitz";
        return "rapid";
    };
    
    const handleCustomTime = () => {
        const initialNum = parseInt(customInitial) || -1;  // Default to 1 if empty or invalid
        const incrementNum = parseInt(customIncrement) || -1;  // Default to 0 if empty or invalid

        if(initialNum === -1 || incrementNum == -1) {
            showToast("Please enter valid initial and increment times", "error");
            return;
        }
        
        const timeFormat = determineTimeFormat(initialNum);
        const timeString = `${initialNum}|${incrementNum}`;
        setTime(timeFormat, timeString);
    };
    return ( 
        <div className="w-full h-full text-text-200">
            <h2 className="text-2xl font-bold mb-4">Select Time</h2>
            {timeArray.map((times)=>
                <div key={times.type}>
                    <div className="flex gap-2 mb-4 font-semibold text-xl items-center">
                        {times.icon}
                        <h2>{times.type}</h2>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {times.times.map((time)=>
                            <Button 
                                key={time} 
                                className={`bg-bg-300 hover:border border-accent-200 ${selectedTime == time && "border"}`}
                                onClick={() => setTime(times.type, time)}
                            >
                                {time}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4">Custom Time</h2>
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col w-full">
                        <label className="text-sm mb-1">Initial (minutes)</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="180" 
                            value={customInitial}
                            onChange={(e) => setCustomInitial(e.target.value)}
                            className="p-2 rounded-md bg-bg-300 w-full focus:outline-none focus:ring-1 focus:ring-accent-200"
                            placeholder="Initial time"
                        />
                    </div>
                    
                    <div className="flex flex-col w-full">
                        <label className="text-sm mb-1">Increment (seconds)</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="60" 
                            value={customIncrement}
                            onChange={(e) => setCustomIncrement(e.target.value)}
                            className="p-2 rounded-md bg-bg-300 w-full focus:outline-none focus:ring-1 focus:ring-accent-200"
                            placeholder="Increment"
                        />
                    </div>
                </div>
                
                <Button 
                    className=""
                    onClick={handleCustomTime}
                >
                    Apply Custom Time
                </Button>
            </div>
        </div>
    );
}

export default TimeSelector;