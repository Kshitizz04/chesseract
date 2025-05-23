"use client"
import { useEffect, useRef, useState } from "react";
import Controls from "@/components/game/Controls";
import ResultModal from "@/components/modals/ResultModal";
import { getLocalStorage } from "@/utils/localstorage";
import { IUser } from "../../../../models/user";
import Button from "@/components/utilities/CustomButton";
import { Chess } from "chess.js";
import Timer from "@/components/game/Timer";
import StandardBoard from "@/components/game/StandardBoard";
import TimeSelector from "@/components/game/TimeSelector";
import { useToast } from "@/contexts/ToastContext";
import SocketService from "@/SocketService";
import FindingMatchModal from "@/components/modals/FindingMatchModal";
import { usePathname, useRouter } from "next/navigation";

const Online = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [result, setResult] = useState<{result: 0 | 1 | 2, message:string} | null>(null);
    const [userData, setUserData] = useState<{username: string, profileImage?: string, rating:number}>({username: "You", profileImage: "", rating: 1200});
    const [opponentData, setOpponentData] = useState<{username: string, profileImage?: string, rating:number}>({username: "Opponent", profileImage: "", rating: 1200});
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [historyFen, setHistoryFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    const [currentPosition, setCurrentPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [findingMatch, setFindingMatch] = useState(false);
    const [time, setTime] = useState<{type:"bullet" | "blitz" | "rapid", time: string}>({type: "rapid", time: "10|0"});
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
    const [size, setSize] = useState(0);
    const [processingComplete, setProcessingComplete] = useState(false);

    const userId = getLocalStorage("userId");
    const chessRef = useRef(new Chess());
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const prevPathnameRef = useRef(pathname)

    const { showToast } = useToast();

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

    // Connect to socket when component mounts
    useEffect(() => {
        const token = getLocalStorage("token");
        if (token) {
            SocketService.connect(token as string);
        }

        return () => {
            if(findingMatch){
                SocketService.emit("cancel_matchmaking", { userId });
            }
        };
    },[findingMatch]);

    //handle disconnections
    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            handleDisconnection();
        }
        prevPathnameRef.current = pathname;

        const handleUnload = () => {
            handleDisconnection();
        };

        const handleNavClick = (event: MouseEvent) => {
            // Find if the click was on an anchor tag or its children
            let target = event.target as Node;
            let anchorElement: HTMLAnchorElement | null = null;
            while (target instanceof Element) {
                if (target.tagName === 'A') {
                    anchorElement = target as HTMLAnchorElement;
                    break;
                }
                target = target.parentNode as Node;
            }
                    
            // If we have an anchor and it's internal link
            if (anchorElement && anchorElement.href && anchorElement.href.startsWith(window.location.origin)) {
                handleDisconnection();
                const targetHref = anchorElement.getAttribute('href');
                const urlPath = new URL(targetHref || '', window.location.origin).pathname;
                router.push(urlPath);
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener('click', handleNavClick);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener('click', handleNavClick);
        };
    }, [pathname, gameStarted, currentGameId]);


    //load user data from local storage
    useEffect(()=>{
        const user = getLocalStorage("user") as IUser;
        if(user){
            setUserData({
                username: user.username,
                profileImage: user.profilePicture,
                rating: user.rating[time.type]
            })
        }
    },[time.type])

    //Setup socket listeners for matchmaking
    useEffect(() => {
        // Listen for match found event
        SocketService.on("match_found", (data) => {
            const { gameId, opponent, color, myRating } = data;
            
            // Setup the game
            setCurrentGameId(gameId);
            setPlayerColor(color === 'white' ? 'w' : 'b');
            setIsMyTurn(color === "white"); // White moves first\
            
            // Reset the chess instance to initial state
            chessRef.current.reset();
            setCurrentPosition(chessRef.current.fen());

            // Set opponent data from the provided details
            setOpponentData({
                username: opponent.username,
                profileImage: opponent.profilePicture,
                rating: opponent.rating
            });
            setUserData((prev)=>({...prev, rating: myRating}))
        });

        // Listen for game start event
        SocketService.on("game_start", () => {
            setProcessingComplete(true);
        });

        // Listen for opponent disconnected
        SocketService.on("opponent_disconnected", (data) => {
            showToast(data.message, "info");
            // You could start a countdown before declaring victory
        });

        // Listen for resigned event
        SocketService.on("player_resigned", (data) => {
            const isWinner = data.winner === (playerColor === 'w' ? 'white' : 'black');
            if (isWinner) {
                setResult({ 
                    result: 1, 
                    message: "Your opponent resigned" 
                });
            } else {
                setResult({
                    result: 2,
                    message: "You resigned"
                });
            }
            setGameStarted(false);
        });

        // Listen for matchmaking error
        SocketService.on("matchmaking_error", (data) => {
            showToast(data.message, "error");
            setFindingMatch(false);
        });

        SocketService.on("game_ended", (data) => {
            console.log("Game ended", data, playerColor);
            if(playerColor === "w"){
                setUserData((prev) => ({...prev, rating: prev.rating + data.whiteRatingChange}));
                setOpponentData((prev) => ({...prev, rating: prev.rating + data.blackRatingChange}));
            }else{
                setUserData((prev) => ({...prev, rating: prev.rating + data.blackRatingChange}));
                setOpponentData((prev) => ({...prev, rating: prev.rating + data.whiteRatingChange}));
            }

            if(data.winner[0] === playerColor) {
                setResult({ result: 1, message: `You won! ${data.reason}` });
            } else if(data.winner === "draw") {
                setResult({ result: 2, message: `It's a draw! ${data.reason}` });
            } else{
                setResult({ result: 0, message: `You lost! ${data.reason}` });
            }
            setGameStarted(false);
        });

        SocketService.on("game_error", (data) => {
            showToast(data.message, "error");
            resetStates();
        })

        // Clean up listeners
        return () => {
            SocketService.off("match_found");
            SocketService.off("matchmaking_error");
            SocketService.off("game_ended");
            SocketService.off("game_error");
        };
    }, [userData.rating, playerColor]);


    const handleViewHistory = (isViewing: boolean, historyFen: string) => {
        setIsViewingHistory(isViewing);
        setHistoryFen(historyFen);
    }

    const handleDisconnection = () => {
        console.log("Disconnected from game", gameStarted, currentGameId);
        if(gameStarted){
            setResult({result: 0, message: "You left the game!"});

            if(currentGameId){
                SocketService.emit("game_over", {
                    gameId: currentGameId,
                    winner: playerColor === "w" ? "black" : "white",
                    reason: "disconnection",
                    fen: chessRef.current.fen(),
                    pgn: chessRef.current.pgn(),
                    moves: chessRef.current.history()
                });
            }
        }
        SocketService.disconnect();
        resetStates();
    }

    const setResultMessage = (result: 0 | 1 | 2, message: string) => {
        setResult({result, message});
        setGameStarted(false);
    }

    const handlePlay = () => {
        // Make sure user is connected to socket
        if (!SocketService.isConnected()) {
            showToast("Not connected to server. Trying to reconnect...", "error");
            const token = getLocalStorage("token");
            SocketService.connect(token as string);
            return;
        }

        if(currentGameId)resetStates();

        setFindingMatch(true);
        
        // Parse the time control
        const [initial, increment] = time.time.split('|').map(Number);
        
        // Emit find match event
        SocketService.findMatch({
            userId: userId as string,
            username: userData.username,
            profilePicture: userData.profileImage || "",
            timeControl: { initial: initial * 60, increment },
            timeFormat: time.type
        });
    }

    const handleCancelMatchmaking = () => {
        if (findingMatch) {
            SocketService.emit("cancel_matchmaking", { userId });
            setFindingMatch(false);
            showToast("Matchmaking canceled", "info");
        }
    }

    const closeMatchmakingAndStartGame = ()=>{
        setFindingMatch(false);
        setGameStarted(true);
    }

    const handleTimeSelect = (type: "bullet" | "blitz" | "rapid", time: string) => {
        setTime({type, time});
    }

    const handleJoinGame = () => {
        // Join the game room
        if (currentGameId) {
            SocketService.joinGame(currentGameId, userId as string);
        }
    }

    const handleResign = ()=>{
        const winner = playerColor === "w" ? "black" : "white";
        // setResult({result: 0, message: "Resignation!"});
        // setGameStarted(false);
        if (currentGameId) {
                        // Report game over to server
            SocketService.emit("game_over", {
                gameId: currentGameId,
                winner,
                reason: "resignation",
                fen: chessRef.current.fen(),
                pgn: chessRef.current.pgn(),
                moves: chessRef.current.history()
            });
        }
    }

    const handleTimeOut=(isOpponent: boolean)=>{
        const result = isOpponent ? 1 : 0;
        setResult({result, message: isOpponent ? "Your opponent ran out of time" : "You ran out of time"});
        const winner = isOpponent ? playerColor==="w" ? "white" : "black" : playerColor==="w" ? "black" : "white";
        setGameStarted(false);
        if (currentGameId) {
            // Report game over to server
            SocketService.emit("game_over", {
                gameId: currentGameId,
                winner: winner,
                reason: "timeout",
                fen: chessRef.current.fen(),
                pgn: chessRef.current.pgn(),
                moves: chessRef.current.history()
            });
        }
    }

    const resetStates = ()=>{
        setResult(null);
        setIsViewingHistory(false);
        setHistoryFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        setGameStarted(false);
        setFindingMatch(false);
        setCurrentGameId(null);
        setPlayerColor("w");
        setIsMyTurn(true);
        chessRef.current.reset();
        setCurrentPosition(chessRef.current.fen());
        setProcessingComplete(false);
    }

    return (
        <div className="page flex flex-col md:flex-row flex-grow justify-around gap-2">
            {/* Main Section */}
            <div className="flex flex-col justify-center h-full w-full md:w-2/3"
                ref={containerRef}
            >
                <Timer
                    profileImage = {opponentData.profileImage}
                    name = {opponentData.username}
                    rating = {opponentData.rating}
                    isRunning= {gameStarted && !isMyTurn}
                    timeControl = {time.time}
                    onTimeOut={handleTimeOut}
                    isOpponent = {true}
                />
                <StandardBoard
                    position={currentPosition}
                    setPosition={setCurrentPosition}
                    chess={chessRef.current}
                    setResult={setResultMessage}
                    gameStarted={gameStarted}
                    isViewingHistory={isViewingHistory}
                    historyFen={historyFen}
                    gameId={currentGameId}
                    playerColor={playerColor}
                    setIsMyTurn={setIsMyTurn}
                    size={size}
                />
                <Timer
                    profileImage = {userData.profileImage}
                    name = {userData.username}
                    rating = {userData.rating}
                    isRunning= {gameStarted && isMyTurn}
                    timeControl = {time.time}
                   onTimeOut={handleTimeOut}
                    isOpponent = {false}
                />
            </div>

            {/* Right Section */}
            <div className="md:w-1/4 w-full md:h-full max-w-md min-w-[225px] p-2 bg-bg-200/60 rounded-md flex flex-col gap-6 place-self-center">
                {!gameStarted ? (
                    <TimeSelector
                        setTime={handleTimeSelect}
                        selectedTime={time.time}
                    />
                ) : (
                    <Controls 
                        chess={chessRef.current}
                        handleViewHistory={handleViewHistory}
                        currentPosition={currentPosition}
                        onResign={handleResign}
                    />
                )}

                {!gameStarted && (
                    <Button className="mt-auto" onClick={handlePlay}>
                        Play
                    </Button>
                )}
            </div>
            {result && <ResultModal result={result.result} message={result.message} onClose={() => setResult(null)} playAgain={handlePlay}/>}
            {findingMatch && 
            <FindingMatchModal
                onCancel={handleCancelMatchmaking}
                userData={userData}
                opponentData={currentGameId ? opponentData : null}
                onJoinGame={handleJoinGame}
                closeAfterJoin={closeMatchmakingAndStartGame}
                timeControl={`${time.time} ${time.type}`}
                processingComplete={processingComplete}
            />}
        </div>
    );
};

export default Online;