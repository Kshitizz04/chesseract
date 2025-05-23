"use client"
import { useEffect, useRef, useState } from "react";
import Controls from "@/components/game/Controls";
import BotBoard from "@/components/game/BotBoard";
import ResultModal from "@/components/modals/ResultModal";
import botAvatar from "@/assets/bot.png";
import { getLocalStorage } from "@/utils/localstorage";
import { IUser } from "../../../../models/user";
import Avatar from "@/components/utilities/Avatar";
import Button from "@/components/utilities/CustomButton";
import { Chess } from "chess.js";

const Bot = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState({difficulty: "easy", rating: 500});
    const [result, setResult] = useState<{result: 0 | 1 | 2, message:string} | null>(null);
    const [myColor, setMyColor] = useState<"w" | "b">("w");
    const [userData, setUserData] = useState<{username: string, profileImage?: string, rating:number}>({username: "You", profileImage: "", rating: 1200});
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [historyFen, setHistoryFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    const [currentPosition, setCurrentPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    const [size, setSize] = useState(0);

    const chessRef = useRef(new Chess());
    const containerRef = useRef<HTMLDivElement>(null);
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

    //sizing of the board
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const container = containerRef.current;
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                if(window.innerWidth<= 768){  //less than md breakpoint of tailwind
                    setSize(width + 112);
                } else{
                    const squareSize = Math.min(width, height);
                    setSize(squareSize);
                }
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const startGame = () => {
        resetStates();
        if(Math.floor(Math.random() * 2) === 0){
            setMyColor("w");
        }else{
            setMyColor("b");
        }
        setGameStarted(true);
    };

    const handleViewHistory = (isViewing: boolean, historyFen: string) => {
        setIsViewingHistory(isViewing);
        setHistoryFen(historyFen);
    }

    const setResultMessage = (result: 0 | 1 | 2, message: string) => {
        setResult({result, message});
        setGameStarted(false);
    }

    const handleResign = () => {
        setResultMessage (0,"You resigned the game")
    }

    const resetStates = ()=>{
        setGameStarted(false);
        setResult(null);
        setMyColor("w");
        setIsViewingHistory(false);
        setHistoryFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        setCurrentPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        chessRef.current = new Chess();
    }

    const handleUndo = ()=>{
        if(chessRef.current.turn() !== myColor){
            chessRef.current.undo();
        }else{
            chessRef.current.undo();
            chessRef.current.undo();
        }
        setCurrentPosition(chessRef.current.fen());
    }

    return (
        <div className="page flex flex-col md:flex-row flex-grow justify-around gap-2">
            {/* Main Section */}
            <div className="flex flex-col justify-center h-full w-full md:w-2/3"
                ref={containerRef}
            >
                <div className="p-2 flex gap-2 items-center w-full max-w-md max-md:place-self-center">
                    <Avatar
                        username="Bot"
                        profileImage={botAvatar.src}
                        showUsername={true}
                    />
                    <p>{`(${difficulty.rating})`}</p>
                </div>
                <BotBoard
                    position={currentPosition}
                    setPosition={setCurrentPosition}
                    chess={chessRef.current}
                    setResult={setResultMessage}
                    myColor={myColor}
                    difficulty={difficulty.difficulty}
                    gameStarted={gameStarted}
                    isViewingHistory={isViewingHistory}
                    historyFen={historyFen}
                    size={size}
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
            <div className="md:w-1/4 w-full md:h-full max-w-md min-w-[225px] p-2 bg-bg-200/60 rounded-md flex flex-col gap-6 place-self-center">
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


                        {/* Play Button */}
                        <Button
                            onClick={startGame}
                            className="mt-6 w-full bg-bg-100 hover:border border-accent-100 cursor-pointer rounded-sm shadow-sm shadow-accent-100"
                        >
                            Play
                        </Button>
                    </div>
                ) : (
                    <Controls 
                        chess={chessRef.current}
                        handleViewHistory={handleViewHistory}
                        currentPosition={currentPosition}
                        onResign={handleResign}
                        handleUndo={handleUndo}
                    />
                )}
            </div>
            {result && <ResultModal result={result.result} message={result.message} playAgain={startGame} onClose={() => setResult(null)} />}
        </div>
    );
};

export default Bot;