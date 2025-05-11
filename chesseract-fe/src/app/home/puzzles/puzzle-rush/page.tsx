"use client"
import { useEffect, useRef, useState } from "react";
import Button from "@/components/utilities/CustomButton";
import { getLocalStorage } from "@/utils/localstorage";
import PuzzleBoard from "@/components/puzzles/PuzzleBoard";
import getPuzzlesInitial from "@/services/getInitialPuzzles";
import getPuzzlesNext from "@/services/getPuzzlesNext";
import { MdPending } from "react-icons/md";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import getPuzzleScore from "@/services/getPuzzleScore";
import { Chess } from "chess.js";
import { useToast } from "@/contexts/ToastContext";
import Avatar from "@/components/utilities/Avatar";
import { SiStackblitz } from "react-icons/si";
import { IoTimerOutline } from "react-icons/io5";
import { GiBurningSkull } from "react-icons/gi";
import updatePuzzleScore from "@/services/updatePuzzleScore";

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
	const [timeLeft, setTimeLeft] = useState(0);
	const [lives, setLives] = useState(3);
	const [puzzleStatuses, setPuzzleStatuses] = useState<PuzzleStatus[]>([]);
	const [loading, setLoading] = useState(false);
	const [highscores, setHighscores] = useState({survival: 0, threeMinute: 0, fiveMinute: 0});
	const [profilePicture, setProfilePicture] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [playerColor, setPlayerColor] = useState<"White"|"Black"|"none">("none");

	const chessRef = useRef(new Chess());
	let userId = "";
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const endRatingRef = useRef(1000);
	const {showToast} = useToast();

	useEffect(()=>{
		userId = getLocalStorage("userId") || "";
	})

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

	useEffect(()=>{
		fetchHighscores();
	}, [userId]);

	// Fetch puzzles when game starts
	const fetchPuzzles = async () => {
		try{
			setLoading(true);
			const res = await getPuzzlesInitial(400, 1000, 10);
			if(res.success){
				setPuzzles(res.data.puzzles);
				endRatingRef.current = res.data.endRating || 1500;
				setPuzzleStatuses(["unsolved"]);
				chessRef.current.load(res.data.puzzles[0].FEN);
				setPlayerColor(res.data.puzzles[0].FEN.split(" ")[1] === "w" ? "Black" : "White");
			}
		}catch(err){
			console.error("Error fetching puzzles:", err);
			showToast("Failed to get puzzles", "error");
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
			showToast("Failed to get more puzzles", "error");
		}
	};

	const fetchHighscores = async () => {
		try {
			const res = await getPuzzleScore(userId as string);
			if(res.success){
				const scores = {survival: res.data.survival, threeMinute: res.data.threeMinute, fiveMinute: res.data.fiveMinute};
				setHighscores(scores);
				setProfilePicture(res.data.profilePicture);
				setUsername(res.data.username);
			}
		}catch(err){
			console.error("Error fetching puzzle scores:", err);
			showToast("Failed to get user info", "error");
		}
	}

	const updateHighscores = async () => {
		try{
			let reqData;
			if(gameMode === "survival"){
				reqData = {survival: currentPuzzleIndex + lives - 3};
			}else if(gameMode === "3min"){
				reqData = {threeMinute: currentPuzzleIndex + lives -3};
			}else{
				reqData = {fiveMinute: currentPuzzleIndex + lives -3};
			}
			const res = await updatePuzzleScore(reqData);
			if(res.success){
				const scores = {survival: res.data.survival, threeMinute: res.data.threeMinute, fiveMinute: res.data.fiveMinute};
				setHighscores(scores);
				setProfilePicture(res.data.profilePicture);
				setUsername(res.data.username);
			}
		}catch(err){
			console.error("Error updating puzzle scores:", err);
			showToast("Failed to update user info", "error");
		}
	}

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
		setPlayerColor("none");
		updateHighscores();

		if (timerRef.current) clearTimeout(timerRef.current);
	};

	// Handle puzzle completion
	const handlePuzzleComplete = (isCorrect: boolean) => {
		const newStatuses = [...puzzleStatuses];
		newStatuses[currentPuzzleIndex] = isCorrect ? "correct" : "incorrect";
		newStatuses.push("unsolved");
		setPuzzleStatuses(newStatuses);

		if(!isCorrect) {
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
			chessRef.current.load(puzzles[nextIndex].FEN);
			setPlayerColor(puzzles[nextIndex].FEN.split(" ")[1] === "w" ? "Black" : "White");
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
					{playerColor!=="none" && <h2 className="text-lg font-semibold">{playerColor} to move</h2>}
					{hasStarted && <p className="text-sm">
						{`Puzzle ${currentPuzzleIndex + 1} - Rating: ${puzzles[currentPuzzleIndex]?.Rating || "Unknown"}`}
					</p>}
				</div>

				<PuzzleBoard
					chess={chessRef.current}
					puzzle={puzzles[currentPuzzleIndex]}
					onComplete={handlePuzzleComplete}
					gameStarted={hasStarted}
				/>
			</div>

			{/* Right Section */}
			<div className="md:w-1/4 w-full md:h-full max-w-md min-w-[225px] md:p-2 bg-bg-200 rounded-md flex flex-col gap-6 place-self-center">
				{!hasStarted ? (
				<div className="w-full h-full text-text-200">
					<h2 className="text-xl font-bold mb-2">Puzzle Rush</h2>

					<div className="w-full flex flex-col items-center gap-2 bg-bg-100 rounded-md mb-4 p-2">
						<Avatar
							username={username}
							showUsername={false}
							profileImage={profilePicture}
							className="rounded-full"
							size={100}
						/>
						<p className="text-lg font-semibold text-start mb-2">Your Scores</p>
						<div className="w-full space-y-2">
							<div className="flex justify-between items-center px-3 py-2 bg-bg-200 rounded-md">
								<div className="flex items-center gap-2">
									<GiBurningSkull className="text-accent-200" />
									<span className="text-md">Survival</span>
								</div>
								<span className="font-bold">{highscores.survival}</span>
							</div>
							<div className="flex justify-between items-center px-3 py-2 bg-bg-200 rounded-md">
								<div className="flex items-center gap-2">
									<SiStackblitz className="text-accent-200" />
									<span className="text-md">3 Minute</span>
								</div>
								<span className="font-bold">{highscores.threeMinute}</span>
							</div>
							<div className="flex justify-between items-center px-3 py-2 bg-bg-200 rounded-md">
								<div className="flex items-center gap-2">
									<IoTimerOutline className="text-accent-200" />
									<span className="text-md">5 Minute</span>
								</div>
								<span className="font-bold">{highscores.fiveMinute}</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col rounded-md bg-bg-100 p-2">
						<Button
							onClick={() => setGameMode("survival")}
							bg={`${gameMode === "survival" ? "bg-bg-200 text-accent-200" : "bg-bg-100"} hover:bg-bg-200`}
						>
							<div className="flex items-center gap-4">
								<GiBurningSkull size={20} />Survival
							</div>
						</Button>
						<Button
							onClick={() => setGameMode("3min")}
							bg={`${gameMode === "3min" ? "bg-bg-200 text-accent-200" : "bg-bg-100"} hover:bg-bg-200`}
						>
							<div className="flex items-center gap-4">
								<SiStackblitz size={20}/>  3 Minutes
							</div>
						</Button>
						<Button
							onClick={() => setGameMode("5min")}
							bg={`${gameMode === "5min" ? "bg-bg-200 text-accent-200" : "bg-bg-100"} hover:bg-bg-200`}
						>
							<div className="flex items-center gap-4">
								<IoTimerOutline size={20}/>  5 Minutes
							</div>
						</Button>
					</div>

					<Button
					onClick={startGame}
					className="mt-6 w-full bg-bg-100 hover:border border-accent-100 cursor-pointer rounded-sm shadow-sm shadow-accent-100"
					disabled={loading}
					>
					{loading ? "Loading..." : "Play"}
					</Button>
				</div>
				) : (
				<div className="flex flex-col gap-4">
					<div className="bg-bg-100 rounded-md p-3 flex justify-center items-center gap-4">
						<div className="text-center">
							<h3 className="font-bold mb-1">Score</h3>
							<div className="text-xl text-accent-200">
								{currentPuzzleIndex + lives - 3}
							</div>
						</div>
						{gameMode !== "survival" && (
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
						className="mt-auto"
					>
						Quit
					</Button>
				</div>
				)}
			</div>
		</div>
	);
};

export default PuzzleRush;