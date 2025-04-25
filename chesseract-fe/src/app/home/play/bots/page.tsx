"use client"
import { useEffect, useRef, useState } from "react";
import Controls from "@/components/game/Controls";
import StandardBoard from "@/components/game/StandardBoard";
import Timer from "@/components/game/Timer";
import ResultModal from "@/components/modals/ResultModal";
import botAvatar from "@/assets/bot.png";
import { getLocalStorage } from "@/utils/localstorage";
import { IUser } from "../../../../../models/user";
import Avatar from "@/components/utilities/Avatar";
import Button from "@/components/utilities/CustomButton";

const Bot = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState({difficulty: "easy", rating: 500});
    const [timeControl, setTimeControl] = useState("3+0");
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [result, setResult] = useState<{result: 0 | 1 | 2, message:string} | null>(null);
    const [myColor, setMyColor] = useState<"w" | "b">("w");
    const [userData, setUserData] = useState<{username: string, profileImage?: string, rating:number}>({username: "You", profileImage: "", rating: 1200});

    const botSkillLevel = [{difficulty: "easy", rating: 500}, {difficulty: "medium", rating: 1000}, {difficulty: "hard", rating: 1500}]

    useEffect(()=>{
        const user = getLocalStorage("user") as IUser;
        if(user){
            setUserData({
                username: user.username,
                profileImage: user.profilePicture,
                rating: user.rating.rapid
            })
        }
    },[])

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
                <div className="p-2 flex gap-2 items-center w-full max-w-md max-md:place-self-center">
                    <Avatar
                        username="Bot"
                        profileImage={botAvatar.src}
                        showUsername={true}
                    />
                    <p>{`(${difficulty.rating})`}</p>
                </div>
                <StandardBoard
                    isMyTurn={isMyTurn}
                    onTurnChange={toggleTurn}
                    setResult={setResultMessage}
                    myColor={myColor}
                    difficulty={difficulty.difficulty}
                    gameStarted={gameStarted}
                />
                <div className="p-2 flex gap-2 items-center w-full max-w-md max-md:place-self-center">
                    <Avatar
                        username={userData.username}
                        profileImage={userData.profileImage}
                        showUsername={true}
                    />
                    <p>{`(${userData.rating})`}</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="md:w-1/4 w-full md:h-full max-w-md md:p-4 md:bg-bg-200 rounded-md flex flex-col gap-6 place-self-center">
                {!gameStarted ? (
                    <div>
                        {/* Difficulty Selection */}
                        <h2 className="text-lg font-bold mb-2">Select Difficulty</h2>
                        <div className="flex gap-2">
                            {botSkillLevel.map((level) => (
                                <Button
                                    key={level.difficulty}
                                    onClick={() => setDifficulty(level)}
                                    className={`bg-bg-100 ${difficulty.difficulty == level.difficulty && "border-1 border-accent-200 text-accent-200"}`}
                                >
                                    {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                                </Button>
                            ))}
                        </div>

                        
                        {/* <h2 className="text-lg font-bold mt-6 mb-2">Select Time Control</h2>
                        <div className="flex flex-col gap-4">
                            
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
                        </div> */}

                        {/* Play Button */}
                        <Button
                            onClick={startGame}
                            className="mt-6 w-full bg-bg-100 hover:border border-accent-100 cursor-pointer rounded-sm shadow-sm shadow-accent-100"
                        >
                            Play
                        </Button>
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