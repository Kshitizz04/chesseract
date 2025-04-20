"use client"
import { useState } from "react";
import Controls from "@/components/game/Controls";
import StandardBoard from "@/components/game/StandardBoard";
import Timer from "@/components/game/Timer";

const Bot = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");
    const [timeControl, setTimeControl] = useState("3+0");
    const [isMyTurn, setIsMyTurn] = useState(true);

    const startGame = () => {
        setGameStarted(true);
    };

    const toggleTurn = () => {
        setIsMyTurn((prev) => !prev);
    };

    return (
        <div className="h-full w-full flex bg-surface rounded-md p-2 gap-2">
            {/* Main Section */}
            <div className="flex-1 flex flex-col items-start justify-center w-full h-full bg-background rounded-md p-2 gap-2">
                <Timer 
                    timeControl={timeControl}
                    isRunning={!isMyTurn && gameStarted}
                />
                <StandardBoard 
                    isMyTurn={isMyTurn}
                    onTurnChange={toggleTurn}
                />
                <Timer 
                    timeControl={timeControl}
                    isRunning={isMyTurn && gameStarted}
                />
            </div>

            {/* Right Section */}
            <div className="w-1/4 p-4 bg-background rounded-md flex flex-col gap-6">
                {!gameStarted ? (
                    <div>
                        {/* Difficulty Selection */}
                        <h2 className="text-lg font-bold mb-2">Select Difficulty</h2>
                        <div className="flex gap-2">
                            {["easy", "medium", "hard"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`p-2 cursor-pointer w-full rounded-md hover:bg-button-hover ${
                                        difficulty === level
                                            ? "bg-button-hover"
                                            : "bg-button"
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
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-button-hover ${
                                                timeControl === control
                                                    ? "bg-button-hover"
                                                    : "bg-button"
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
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-button-hover ${
                                                timeControl === control
                                                    ? "bg-button-hover"
                                                    : "bg-button"
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
                                            className={`p-2 cursor-pointer w-full rounded-md hover:bg-button-hover ${
                                                timeControl === control
                                                    ? "bg-button-hover"
                                                    : "bg-button"
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
                            className="mt-6 w-full p-2 bg-button hover:bg-button-hover cursor-pointer text-white rounded-md"
                        >
                            Play
                        </button>
                    </div>
                ) : (
                    <Controls />
                )}
            </div>

        </div>
    );
};

export default Bot;