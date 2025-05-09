"use client"
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Button from "@/components/utilities/CustomButton";
import { getLocalStorage } from "@/utils/localstorage";
import { IUser } from "../../../../models/user";
import PuzzleBoard from "@/components/puzzles/PuzzleBoard";
import getPuzzlesInitial from "@/services/getInitialPuzzles";
import getPuzzlesNext from "@/services/getPuzzlesNext";
import { MdPending } from "react-icons/md";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";

type GameMode = "survival" | "3min" | "5min";
type PuzzleStatus = "unsolved" | "correct" | "incorrect";

interface Puzzle {
    _id: string;
    PuzzleId: string;
    FEN: string;
    Moves: string;
    Rating: number;
    Themes: string;
    OpeningTags: string;
}

const PuzzleRush = () => {
	const [hasStarted, setHasStarted] = useState(false);
	const [gameMode, setGameMode] = useState<GameMode>("survival");
	const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
	const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
	const [position, setPosition] = useState("");
	const [timeLeft, setTimeLeft] = useState(0);
	const [lives, setLives] = useState(3);
	const [puzzleStatuses, setPuzzleStatuses] = useState<PuzzleStatus[]>([]);
	const [loading, setLoading] = useState(false);
	const [userData, setUserData] = useState<{username: string, profileImage?: string, rating:number}>({
		username: "You", 
		profileImage: "", 
		rating: 1200
	});

	const chessRef = useRef(new Chess());
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const endRatingRef = useRef(1000);

	useEffect(() => {
		const user = getLocalStorage("user") as IUser;
		if(user) {
		setUserData({
			username: user.username,
			profileImage: user.profilePicture,
			rating: user.rating.rapid
		});
		}
	}, []);

  // Handle timer countdown
	useEffect(() => {
		if (hasStarted && timeLeft > 0) {
		timerRef.current = setTimeout(() => {
			setTimeLeft(prev => prev - 1);
		}, 1000);
		} else if (timeLeft === 0 && hasStarted && gameMode !== "survival") {
		// Time's up for timed modes
		endGame();
		}

		return () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [hasStarted, timeLeft]);

	// Fetch puzzles when game starts
	const fetchPuzzles = async () => {
		try{
			setLoading(true);
			const res = await getPuzzlesInitial(400, 1000, 10);
			if(res.success){
				setPuzzles(res.data.puzzles);
				endRatingRef.current = res.data.endRating || 1500;
				setPosition(res.data.puzzles[0].FEN);
				chessRef.current.load(res.data.puzzles[0].FEN);
				setPuzzleStatuses(["unsolved"]);
			}
		}catch(err){
			console.error("Error fetching puzzles:", err);
		}finally{
			setLoading(false);
		}
	};

  	// Fetch more puzzles when needed
	const fetchMorePuzzles = async () => {
		try {
			const res = await getPuzzlesNext(endRatingRef.current, 10);
			if(res.success){
				setPuzzles(prev => [...prev, ...res.data.puzzles]);
				endRatingRef.current = res.data.endRating || endRatingRef.current + 500;
			}
		}catch(err){
			console.error("Error fetching more puzzles:", err);
		}
	};

	// Start the game
	const startGame = () => {
		setHasStarted(true);
		setPuzzleStatuses([]);
		setCurrentPuzzleIndex(0);
		
		// Set timer based on game mode
		if (gameMode === "3min") {
		setTimeLeft(180);
		} else if (gameMode === "5min") {
		setTimeLeft(300);
		}
		
		setLives(3);
		fetchPuzzles();
	};

	// End the game
	const endGame = () => {
		setHasStarted(false);
		if (timerRef.current) clearTimeout(timerRef.current);
	};

	// Handle puzzle completion
	const handlePuzzleComplete = (isCorrect: boolean) => {
		const newStatuses = [...puzzleStatuses];
		newStatuses[currentPuzzleIndex] = isCorrect ? "correct" : "incorrect";
		newStatuses.push("unsolved");
		setPuzzleStatuses(newStatuses);

		if (!isCorrect && gameMode === "survival") {
		setLives(prev => prev - 1);
		if (lives <= 1) {
			endGame();
			return;
		}
		}
		const nextIndex = currentPuzzleIndex + 1;
		if (nextIndex >= puzzles.length - 2) {
			// If we're approaching the end of our puzzle list, fetch more
			fetchMorePuzzles();
		}
		
		if (nextIndex < puzzles.length) {
			setCurrentPuzzleIndex(nextIndex);
			setPosition(puzzles[nextIndex].FEN);
			chessRef.current.load(puzzles[nextIndex].FEN);
		} else {
			endGame();
		}
	};

	// Format time display
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
	};

	return (
		<div className="h-full w-full flex justify-around max-md:flex-col rounded-md gap-2">
			{/* Main Section */}
			<div className="flex flex-col justify-center w-full h-max md:h-full md:w-max rounded-md md:p-2 gap-2">
				<div className="p-2 flex gap-2 items-center w-full max-w-md max-md:place-self-center">
					<h2 className="text-lg font-semibold">Puzzle Rush</h2>
					{hasStarted && <p className="text-sm">
						{`Puzzle ${currentPuzzleIndex + 1} - Rating: ${puzzles[currentPuzzleIndex]?.Rating || "Unknown"}`}
					</p>}
				</div>

				<PuzzleBoard
					position={position}
					puzzle={puzzles[currentPuzzleIndex]}
					onComplete={handlePuzzleComplete}
					chess={chessRef.current}
					gameStarted={hasStarted}
				/>
			</div>

			{/* Right Section */}
			<div className="md:w-1/4 w-full md:h-full max-w-md min-w-[225px] md:p-2 bg-bg-200 rounded-md flex flex-col gap-6 place-self-center">
				{!hasStarted ? (
				<>
					<h2 className="text-lg font-bold mb-2">Select Game Mode</h2>
					<div className="flex flex-col gap-3">
					<Button
						onClick={() => setGameMode("survival")}
						className={`${gameMode === "survival" ? "border-1 border-accent-200 text-accent-200" : "bg-bg-100"}`}
					>
						Survival (3 Lives)
					</Button>
					<Button
						onClick={() => setGameMode("3min")}
						className={`${gameMode === "3min" ? "border-1 border-accent-200 text-accent-200" : "bg-bg-100"}`}
					>
						3 Minutes
					</Button>
					<Button
						onClick={() => setGameMode("5min")}
						className={`${gameMode === "5min" ? "border-1 border-accent-200 text-accent-200" : "bg-bg-100"}`}
					>
						5 Minutes
					</Button>
					</div>

					<Button
					onClick={startGame}
					className="mt-6 w-full bg-bg-100 hover:border border-accent-100 cursor-pointer rounded-sm shadow-sm shadow-accent-100"
					disabled={loading}
					>
					{loading ? "Loading..." : "Play"}
					</Button>
				</>
				) : (
				<div className="flex flex-col gap-4">
					{/* Timer or Lives */}
					<div className="bg-bg-100 rounded-md p-3 flex justify-center items-center">
					{gameMode === "survival" ? (
						<div className="text-center">
							<h3 className="font-bold mb-1">Score</h3>
							<div className="text-xl text-accent-200">
								{currentPuzzleIndex + lives - 3}
							</div>
						</div>
					) : (
						<div className="text-center">
						<h3 className="font-bold mb-1">Time Left</h3>
						<div className="text-xl font-mono">{formatTime(timeLeft)}</div>
						</div>
					)}
					</div>

					{/* Puzzles Solved */}
					<div className="flex flex-col gap-2">
					<h3 className="font-bold">Puzzles Solved</h3>
					<div className="grid grid-cols-5">
						{puzzleStatuses.map((status, index) => (
							<div key={index} className="text-center p-1 flex flex-col items-center justify-center">
								{status === "correct" ? (
									<IoMdCheckmarkCircle className="text-green-500 w-6 h-6" />
								) : status === "incorrect" ? (
									<IoMdCloseCircle className="text-red-500 w-6 h-6"/>
								) : (
									<MdPending className="text-gray-500 w-6 h-6"/>
								)}
								{puzzles[index] && <p>{puzzles[index].Rating}</p>}
							</div>
						))}
					</div>
					</div>

					{/* End Game Button */}
					<Button
					onClick={endGame}
					className="mt-auto bg-red-500 hover:bg-red-600"
					>
					End Game
					</Button>
				</div>
				)}
			</div>
		</div>
	);
};

export default PuzzleRush;