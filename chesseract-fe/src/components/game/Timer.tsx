import { useEffect, useState } from "react";

interface TimerProps {
    isRunning: boolean;
    timeControl: string; 
    setResult: (result: 0 | 1 | 2, message: string) => void;
    isOpponent: boolean;
}

const Timer = ({ isRunning, timeControl, setResult, isOpponent }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(1); 
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
            const result = isOpponent ? 1 : 0;
            setResult(result, isOpponent ? "Your opponent ran out of time" : "You ran out of time")
        }
    },[timeLeft])

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="p-2 rounded-md text-center w-full max-w-md max-md:place-self-center">
            <h3 className="text-lg font-bold">{formatTime(timeLeft)}</h3>
        </div>
    );
};

export default Timer;