"use client"
import { useEffect, useRef, useState } from "react";
import Controls from "@/components/game/Controls";
import StandardBoard from "@/components/game/StandardBoard";
import Timer from "@/components/game/Timer";
import ResultModal from "@/components/modals/ResultModal";

const Bot = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");
    const [timeControl, setTimeControl] = useState("3+0");
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [result, setResult] = useState<{result: 0 | 1 | 2, message:string} | null>(null);
    const [myColor, setMyColor] = useState<"w" | "b">("w");

    useEffect(()=>{
        if(myColor === "w"){
            setIsMyTurn(true)
        }else{
            setIsMyTurn(false)
        }
    },[myColor])

    const startGame = () => {
        Math.floor(Math.random() * 2) === 0 ? setMyColor("w") : setMyColor("b");
        setGameStarted(true);
    };

    const toggleTurn = () => {
        setIsMyTurn((prev) => !prev);
    };

    const setResultMessage = (result: 0 | 1 | 2, message: string) => {
        setResult({result, message});
        setGameStarted(false);
    }

    return (
        <div className="h-full w-full flex justify-around max-md:flex-col rounded-md p-2 gap-2">
            {/* Main Section */}
            <div className="flex flex-col justify-center w-full h-max md:h-full md:w-max rounded-md md:p-2 gap-2">
                <Timer 
                    timeControl={timeControl}
                    isRunning={!isMyTurn && gameStarted}
                    setResult={setResultMessage}
                    isOpponent={true}
                />
                <StandardBoard
                    isMyTurn={isMyTurn}
                    onTurnChange={toggleTurn}
                    setResult={setResultMessage}
                    myColor={myColor}
                />
                <Timer 
                    timeControl={timeControl}
                    isRunning={isMyTurn && gameStarted}
                    setResult={setResultMessage}
                    isOpponent={false}
                />
            </div>

            {/* Right Section */}
            <div className="md:w-1/4 w-full md:h-full max-w-md md:p-4 md:bg-bg-200 rounded-md flex flex-col gap-6 place-self-center">
                {!gameStarted ? (
                    <div>
                        {/* Difficulty Selection */}
                        <h2 className="text-lg font-bold mb-2">Select Difficulty</h2>
                        <div className="flex gap-2">
                            {["easy", "medium", "hard"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`p-2 cursor-pointer w-full rounded-md hover:bg-primary-200 ${
                                        difficulty === level
                                            ? "bg-primary-200"
                                            : "bg-primary-100"
                                    }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Time Control Selection */}
                        <h2 className="text-lg font-bold mt-6 mb-2">Select Time Control</h2>
                        <div className="flex flex-col gap-4">
                            {/* Bullet Section */}
                            <div>
                                <h3 className="font-semibold mb-2">Bullet</h3>
                                <div className="flex gap-2">
                                    {["1+0", "2+0", "1+1"].map((control) => (
                                        <button
                                            key={control}
                                            onClick={() => setTimeControl(control)}
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-primary-200 ${
                                                timeControl === control
                                                    ? "bg-primary-200"
                                                    : "bg-primary-100"
                                            }`}
                                        >
                                            {control}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Blitz Section */}
                            <div>
                                <h3 className="font-semibold mb-2">Blitz</h3>
                                <div className="flex gap-2">
                                    {["3+0", "5+0", "5+5"].map((control) => (
                                        <button
                                            key={control}
                                            onClick={() => setTimeControl(control)}
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-primary-200 ${
                                                timeControl === control
                                                    ? "bg-primary-200"
                                                    : "bg-primary-100"
                                            }`}
                                        >
                                            {control}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rapid Section */}
                            <div>
                                <h3 className="font-semibold mb-2">Rapid</h3>
                                <div className="flex gap-2">
                                    {["10+0", "15+0", "20+0"].map((control) => (
                                        <button
                                            key={control}
                                            onClick={() => setTimeControl(control)}
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-primary-200 ${
                                                timeControl === control
                                                    ? "bg-primary-200"
                                                    : "bg-primary-100"
                                            }`}
                                        >
                                            {control}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Play Button */}
                        <button
                            onClick={startGame}
                            className="mt-6 w-full p-2 bg-primary-100 hover:bg-primary-200 cursor-pointer text-white rounded-md"
                        >
                            Play
                        </button>
                    </div>
                ) : (
                    <Controls />
                )}
            </div>
            {result && <ResultModal result={result.result} message={result.message} onClose={() => setResult(null)} />}
        </div>
    );
};

export default Bot;