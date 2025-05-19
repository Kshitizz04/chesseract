"use client"
import { useRouter } from "next/navigation"
import { FaChessKnight, FaChessKing } from "react-icons/fa6"
import { GiPuzzle } from "react-icons/gi"
import { FiUsers } from "react-icons/fi"
import { IoStatsChartSharp } from "react-icons/io5"
import { useState, useEffect } from "react"
import Avatar from "@/components/utilities/Avatar"
import { useLayout } from "@/contexts/useLayout"
import getUserGames, { GetGameHistoryData } from "@/services/getUserGames"
import { getLocalStorage } from "@/utils/localstorage"
import { TimeFormats } from "@/models/GameUtilityTypes"
import { useToast } from "@/contexts/ToastContext"
import GameHistory from "@/components/GameHistory"
import { IconType } from "react-icons"
import getUserRatingHistory, { GetUserRatingHistoryData } from "@/services/getUserRatingHistory"
import fillMissingHistory, { getStartDate } from "@/utils/fillMissingHistory"
import LoadingSpinner from "@/components/utilities/LoadingSpinner"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const Home = () => {
    const [historyTab, setHistoryTab] = useState('all');
    const [gameHistory, setGameHistory] = useState<GetGameHistoryData | null>(null);
    const [loadingGameHistory, setLoadingGameHistory] = useState(false);
    const [loadingRatingHistory, setLoadingRatingHistory] = useState(false);
	const [ratingHistory, setRatingHistory] = useState<GetUserRatingHistoryData | null>(null);
    const [page, setPage] = useState(1);
    
    const router = useRouter();
    const userId = getLocalStorage('userId')
    const limit = 10;
    const {authData} = useLayout()
    const {showToast} = useToast()

    const selectHistoryTab = (tab: string) => {
		setHistoryTab(tab);
	}

    useEffect(()=>{
		const fetchGameHistory = async (tab: string) => {
			let format = null;
			if(['bullet', 'blitz', 'rapid'].includes(tab)){
				format = tab as TimeFormats;
			}
			try{
				setLoadingGameHistory(true);
				const response = await getUserGames(userId as string, format, limit, page);
				if(response.success){
					setGameHistory(response.data);
				}else {
					const error = response.error || "An error occurred";
					showToast(error, "error");
				}
			}catch(err){
				console.log("failed to fetch game history", err);
			}finally{
				setLoadingGameHistory(false);
			}
		}
		fetchGameHistory(historyTab);
	},[page, historyTab]);

    useEffect(()=>{
		const fetchRatingHistory = async () => {
			try{
				setLoadingRatingHistory(true);
				const response = await getUserRatingHistory(userId as string, null, "1w");
				if(response.success){
					const startDate = getStartDate("1w");
					const endDate = new Date();
					const filledHistory = fillMissingHistory(response.data, startDate, endDate);
					setRatingHistory(filledHistory);
				}else {
					const error = response.error || "An error occurred";
					showToast(error, "error");
				}
			}catch(err){
				console.log("failed to fetch user rating history", err);
			}finally{
				setLoadingRatingHistory(false);
			}
		}
		fetchRatingHistory();
	}, [userId]);

    const Card = ({path, Icon, heading, desc, iconClasses}:{path: string, Icon: IconType, heading:string, desc: string, iconClasses:string})=>{
        return(
            <div 
                className="w-64 h-40 bg-gradient-to-br from-bg-200 to-bg-300 rounded-lg p-5 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-[1.03] transition-transform flex-shrink-0"
                onClick={() => router.push(path)}
            >
                <div className="flex gap-2 items-center">
                    <Icon size={40} className={iconClasses}/>
                    <h2 className="text-lg font-semibold mb-2">{heading}</h2>
                </div>
                <p className="text-center text-text-200 text-md">{desc}</p>
            </div>
        )
    }

    return(
        <div className="page p-4 flex flex-col gap-6">
            <div className="w-full rounded-lg shadow-lg text-center p-2">
                <Avatar 
                    profileImage={authData?.profilePicture} 
                    username={authData?.username || "User"}
                    size={40}
                    showUsername={true}
                    onClick={() => router.push('/home/profile')}
                />
            </div>

            {/* Options tape */}
            <div className="flex flex-shrink-0 w-full overflow-x-scroll gap-4 p-1">
                <Card
                    path="/home/play"
                    Icon={FaChessKnight}
                    iconClasses="text-accent-200 mb-4"
                    heading="Play Chess"
                    desc="Challenge players online, face your friends, or test yourself against bots"
                />
                <Card
                    path="/home/puzzles"
                    Icon={GiPuzzle}
                    iconClasses="text-[#F7C631] mb-4"
                    heading="Puzzles"
                    desc="Train your mind with daily challenges and tactical puzzles"
                />
                <Card
                    path="/home/people"
                    Icon={FiUsers}
                    iconClasses="text-accent-100 mb-4"
                    heading="Connect"
                    desc="Find friends, challenge rivals, and build your chess network"
                />
                <Card
                    path="/home/leaderboard"
                    Icon={IoStatsChartSharp}
                    iconClasses="text-gradient-end mb-4"
                    heading="Leaderboard"
                    desc="See how you rank among the best chess players"
                />
                <Card
                    path="/home/profile"
                    Icon={FaChessKing}
                    iconClasses="text-[#81B64C] mb-4"
                    heading="Your Profile"
                    desc="Track your progress and analyze your gameplay"
                />
            </div>

            <div className="h-full flex max-md:flex-col w-full gap-2">

                {/* game history */}
                <div className="h-full w-full md:w-3/4">
                    <GameHistory
                        gameHistory={gameHistory}
                        loadingGameHistory={loadingGameHistory}
                        setPage={setPage}
                        page={page}
                        setHistoryTab={selectHistoryTab}
                        historyTab={historyTab}
                        userId={userId as string}
                    />
                </div>

                <div className="w-full md:w-1/4 h-full">
                    <div className="h-96 w-full bg-bg-100/60 rounded-md pt-6 p-2 flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 text-center">You In The Last Week</h2>
                        {loadingRatingHistory || !ratingHistory ? (
                            <div className='flex items-center justify-center h-full w-full'>
                                <LoadingSpinner/>
                            </div>
                        ): (ratingHistory.blitz.length>0 || ratingHistory.bullet.length>0 || ratingHistory.rapid.length>0) ? (
                        <ResponsiveContainer width="100%" height={"100%"}>
                            <LineChart
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date" 
                                allowDuplicatedCategory={false} 
                            />
                            <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone" 
                                dataKey="rating" 
                                name="Bullet" 
                                data={ratingHistory?.bullet} 
                                stroke="#ff6b6b" 
                                strokeWidth={2} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="rating" 
                                name="Blitz" 
                                data={ratingHistory?.blitz} 
                                stroke="#4dabf7" 
                                strokeWidth={2} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="rating" 
                                name="Rapid" 
                                data={ratingHistory?.rapid} 
                                stroke="#40c057" 
                                strokeWidth={2} 
                            />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='flex items-center justify-center h-full w-full'>
                            <p className="text-muted-foreground">No rating history found</p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home