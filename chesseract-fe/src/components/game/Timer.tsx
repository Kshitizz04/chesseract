import { useEffect, useState } from "react";

interface TimerProps {
    isRunning: boolean;
    timeControl: string; 
}

const Timer = ({ isRunning, timeControl }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(0); 
    const increment = parseInt(timeControl.split("+")[1]) || 0;

    useEffect(() => {
        // Parse the initial time from the timeControl prop
        const initialMinutes = parseInt(timeControl.split("+")[0]);
        setTimeLeft(initialMinutes * 60);
    }, [timeControl]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isRunning) {
            timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(prev - 1, 0)); // Decrease time by 1 second
            }, 1000);
        } else if (timer) {
            clearInterval(timer); // Pause the timer
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="p-2 bg-surface rounded-md text-center">
            <h3 className="text-lg font-bold">{formatTime(timeLeft)}</h3>
        </div>
    );
};

export default Timer;