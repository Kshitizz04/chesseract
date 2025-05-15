"use client"
import { useRouter } from "next/navigation"
import { FaChessKnight, FaChessKing, FaChartLine } from "react-icons/fa6"
import { GiPuzzle } from "react-icons/gi"
import { FiUsers } from "react-icons/fi"
import { IoStatsChartSharp } from "react-icons/io5"
import { LuLightbulb } from "react-icons/lu"
import { FaHistory } from "react-icons/fa"
import Image from "next/image"
import { useState, useEffect } from "react"

const Home = () => {
    const router = useRouter();
    //const [dailyPuzzle, setDailyPuzzle] = useState<string | null>(null);
    const [recentGames, setRecentGames] = useState<any[]>([]);
    const [dailyTip, setDailyTip] = useState<string>("");
    const [weeklyRatings, setWeeklyRatings] = useState<any[]>([]);

    const dailyPuzzle = null;
    
    // Mock data - would be replaced with real API calls
    useEffect(() => {
        // Mock recent games
        setRecentGames([
            { id: 1, opponent: "ChessMaster45", result: "win", date: "2 hours ago" },
            { id: 2, opponent: "QueenGambit", result: "loss", date: "Yesterday" },
            { id: 3, opponent: "KnightRider", result: "draw", date: "2 days ago" },
        ]);

        // Mock chess tip
        setDailyTip("Control the center! Occupying the middle of the board gives your pieces maximum mobility and impact.");
        
        // Mock weekly rating data
        setWeeklyRatings([
            { day: "Mon", rating: 1200 },
            { day: "Tue", rating: 1220 },
            { day: "Wed", rating: 1210 },
            { day: "Thu", rating: 1250 },
            { day: "Fri", rating: 1280 },
            { day: "Sat", rating: 1260 },
            { day: "Sun", rating: 1290 },
        ]);
    }, []);

    return(
        <div className="h-full w-full p-4 flex flex-col gap-6">
            {/* Welcome Section */}
            <div className="w-full p-6 rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold mb-2 gradient-text">Welcome to Chesseract</h1>
                {/* <p className="text-xl text-text-200 gradeint-text">Where strategy meets elegance</p> */}
            </div>
            
            {/* Asymmetric Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 flex-grow">
                {/* Play Card - Span 4 columns */}
                <div 
                    className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => router.push('/home/play')}
                >
                    <FaChessKnight size={60} className="text-accent-200 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Play Chess</h2>
                    <p className="text-center text-text-200">Challenge players online, face your friends, or test yourself against bots</p>
                </div>
                
                {/* Puzzles Card - Span 3 columns */}
                <div 
                    className="md:col-span-3 lg:col-span-3 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => router.push('/home/puzzles')}
                >
                    <GiPuzzle size={60} className="text-[#F7C631] mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Puzzles</h2>
                    <p className="text-center text-text-200">Train your mind with daily challenges and tactical puzzles</p>
                </div>
                
                {/* Tips & Tricks Card - Span 5 columns */}
                <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col">
                    <div className="flex items-center mb-3">
                        <LuLightbulb size={32} className="text-[#F7C631] mr-3" />
                        <h2 className="text-2xl font-semibold">Daily Tip</h2>
                    </div>
                    <div className="bg-bg-100/30 rounded-md p-4 flex-grow">
                        <p className="text-text-100 italic">{dailyTip}</p>
                    </div>
                </div>
                
                {/* People Card - Span 3 columns */}
                <div 
                    className="md:col-span-3 lg:col-span-3 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => router.push('/home/people')}
                >
                    <FiUsers size={60} className="text-accent-100 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Connect</h2>
                    <p className="text-center text-text-200">Find friends, challenge rivals, and build your chess network</p>
                </div>
                
                {/* Weekly Ratings Chart - Span 5 columns */}
                <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg">
                    <div className="flex items-center mb-3">
                        <FaChartLine size={24} className="text-accent-200 mr-3" />
                        <h2 className="text-xl font-semibold">Your Rating This Week</h2>
                    </div>
                    <div className="h-40 bg-bg-100/30 rounded-md p-2 flex items-end justify-between">
                        {weeklyRatings.map((day, i) => (
                            <div key={i} className="flex flex-col items-center w-full">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className="bg-accent-200 rounded-sm w-4" 
                                        style={{ height: `${(day.rating - 1150) / 2}px` }}
                                    />
                                </div>
                                <span className="text-xs mt-1">{day.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-right">
                        <span className="text-sm text-text-200">Current: {weeklyRatings[6]?.rating || 'N/A'}</span>
                    </div>
                </div>
                
                {/* Leaderboard Card - Span 3 columns */}
                <div 
                    className="md:col-span-3 lg:col-span-3 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => router.push('/home/leaderboard')}
                >
                    <IoStatsChartSharp size={60} className="text-gradient-end mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Leaderboard</h2>
                    <p className="text-center text-text-200">See how you rank among the best chess players</p>
                </div>
                
                {/* Recent Games - Span 4 columns */}
                <div className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg">
                    <div className="flex items-center mb-3">
                        <FaHistory size={24} className="text-gradient-end mr-3" />
                        <h2 className="text-xl font-semibold">Recent Games</h2>
                    </div>
                    <div className="space-y-2">
                        {recentGames.map((game) => (
                            <div 
                                key={game.id}
                                className="bg-bg-100/30 rounded-md p-3 flex items-center justify-between cursor-pointer hover:bg-bg-100/50 transition-colors"
                                onClick={() => router.push(`/home/game/${game.id}`)}
                            >
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${
                                        game.result === 'win' ? 'bg-green-500' : 
                                        game.result === 'loss' ? 'bg-red-500' : 'bg-gray-400'
                                    }`} />
                                    <span>{game.opponent}</span>
                                </div>
                                <span className="text-sm text-text-200">{game.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Profile Card - Span 3 columns */}
                <div 
                    className="md:col-span-3 lg:col-span-3 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => router.push('/home/profile')}
                >
                    <FaChessKing size={60} className="text-[#81B64C] mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
                    <p className="text-center text-text-200">Track your progress and analyze your gameplay</p>
                </div>
                
                {/* Daily Puzzle Teaser - Span 5 columns */}
                <div 
                    className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg shadow-lg flex flex-col cursor-pointer hover:scale-[1.01] transition-transform overflow-hidden"
                    onClick={() => router.push('/home/puzzles/daily-puzzle')}
                >
                    <div className="w-full h-48 bg-bg-100/30 flex items-center justify-center">
                        {dailyPuzzle ? (
                            <Image 
                                src={dailyPuzzle} 
                                alt="Daily Puzzle" 
                                width={200} 
                                height={200} 
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-48 h-48 bg-bg-300 rounded-md flex items-center justify-center">
                                <span className="text-lg font-medium">Today&apos;s Challenge</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4 text-center">
                        <h2 className="text-2xl font-semibold mb-2">Daily Puzzle</h2>
                        <p className="text-text-200">Solve today&apos;s chess puzzle</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home