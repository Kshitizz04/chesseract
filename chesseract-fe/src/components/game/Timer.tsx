import { useEffect, useState } from "react";
import Avatar from "../utilities/Avatar";

interface TimerProps {
    profileImage?: string;
    name: string;
    rating: number;
    isRunning: boolean;
    timeControl: string; 
    isOpponent: boolean;
    onTimeOut:(isOpponent: boolean)=> void;
}

const Timer = ({ isRunning, timeControl, onTimeOut, isOpponent, name, profileImage, rating }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(1); 
    const increment = parseInt(timeControl.split("+")[1]) || 0;

    useEffect(() => {
        // Parse the initial time from the timeControl prop
        const initialMinutes = parseInt(timeControl.split("|")[0]);
        setTimeLeft(initialMinutes * 60);
    }, [timeControl]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isRunning) {
            timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(prev - 1, 0)); // Decrease time by 1 second
            }, 1000);
        } else {
            if(timer){
                clearInterval(timer); // Pause the timer
            }
            setTimeLeft((prev) => prev + increment); // Add increment time when paused
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning]);

    useEffect(()=>{
        if(timeLeft <= 0){
            onTimeOut(isOpponent);
        }
    },[timeLeft])

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="p-2 flex justify-between items-center w-full max-w-md max-md:place-self-center">
            <div className="flex items-center gap-2">
                <Avatar
                    username={name}
                    profileImage={profileImage}
                    showUsername={true}
                />
                <p>({rating})</p>
            </div>
            <h3 className="text-lg font-bold">{formatTime(timeLeft)}</h3>
        </div>
    );
};

export default Timer;