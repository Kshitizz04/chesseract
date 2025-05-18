'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TimeFormats, TimeFrame } from '@/models/GameUtilityTypes';
import { getLocalStorage } from '@/utils/localstorage';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/utilities/LoadingSpinner';
import getUserGames, { GetGameHistoryData } from '@/services/getUserGames';
import getUserStats, { GetUserStatsData } from '@/services/getUserStats';
import getUserRatingHistory, { GetUserRatingHistoryData } from '@/services/getUserRatingHistory';
import getAdvancedAnalytics, { GetAdvancedAnalyticsData } from '@/services/getAdvancedAnalytics';
import FriendList from '@/components/profile/FriendList';
import UserInfoCard from '@/components/profile/UserInfoCard';
import fillMissingHistory, { getStartDate } from '@/utils/fillMissingHistory';
import TimeframeDropdown from '@/components/profile/TimeframeDropdown';
import GameHistory from '@/components/GameHistory';

const Profile = () => {
	const [activeTab, setActiveTab] = useState('all');
	const [historyTab, setHistoryTab] = useState('all');
	const [timeframe, setTimeframe] = useState<TimeFrame>('1w');
	const [loadingGameHistory, setLoadingGameHistory] = useState(false);
	const [loadingStats, setLoadingStats] = useState(false);
	const [loadingRatingHistory, setLoadingRatingHistory] = useState(false);
	const [loadingAnalytics, setLoadingAnalytics] = useState(false);
	const [page, setPage] = useState(1);

	const [gameHistory, setGameHistory] = useState<GetGameHistoryData | null>(null);
	const [stats, setStats] = useState<GetUserStatsData | null>(null);
	const [ratingHistory, setRatingHistory] = useState<GetUserRatingHistoryData | null>(null);
	const [analytics, setAnalytics] = useState<GetAdvancedAnalyticsData | null>(null);

	const userId = getLocalStorage('userId')
	const limit = 10;
	const { showToast } = useToast();

	// Analytics calculations
	const getWinRate = (format: TimeFormats) => {
		if(!stats) return 0;
		const data = stats.stats[format];
		return data.gamesPlayed > 0 
		? Math.round((data.wins / data.gamesPlayed) * 100) 
		: 0;
	};

	const getPieData = (format: TimeFormats) => [
		{ name: 'Wins', value: stats?.stats[format].wins, color: '#4ade80' },
		{ name: 'Losses', value: stats?.stats[format].losses, color: '#f87171' },
		{ name: 'Draws', value: stats?.stats[format].draws, color: '#a3a3a3' },
	];

	const selectTimeframe = (timeframe: TimeFrame) => {
		setTimeframe(timeframe);
	}

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
		const fetchStats = async () => {
			try{
				setLoadingStats(true);
				const response = await getUserStats(userId as string, null);
				if(response.success){
					setStats(response.data);
				}else {
					const error = response.error || "An error occurred";
					showToast(error, "error");
				}
			}catch(err){
				console.log("failed to fetch user stats", err);
			}finally{
				setLoadingStats(false);
			}
		}
		fetchStats();
	}, [userId]);

	useEffect(()=>{
		const fetchRatingHistory = async () => {
			try{
				setLoadingRatingHistory(true);
				const response = await getUserRatingHistory(userId as string, null, timeframe);
				if(response.success){
					const startDate = getStartDate(timeframe);
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
	}, [userId, timeframe]);

	useEffect(()=>{
		const fetchAnalytics = async (tab: string) => {
			let format = null;
			if(['bullet', 'blitz', 'rapid'].includes(tab)){
				format = tab as TimeFormats;
			}
			try{
				setLoadingAnalytics(true);
				const response = await getAdvancedAnalytics(userId as string, format);
				if(response.success){
					setAnalytics(response.data);
				}else {
					const error = response.error || "An error occurred";
					showToast(error, "error");
				}
			}catch(err){
				console.log("failed to fetch user analytics", err);
			}finally{
				setLoadingAnalytics(false);
			}
		}
		fetchAnalytics(activeTab);
	}, [userId, activeTab]);

	const COLORS = ['#4ade80', '#f87171', '#a3a3a3'];

	return (
		<div className="h-full w-full p-2 rounded-md max-md:overflow-scroll">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full">
				{/* User Profile Card */}
				<div className="md:col-span-1 h-full flex flex-col">
					<UserInfoCard isForProfile={true} userId={userId as string} totalGames={stats ? stats.stats.bullet.gamesPlayed + stats.stats.blitz.gamesPlayed + stats.stats.rapid.gamesPlayed : 0}/>
					<FriendList isForProfile={true} userId={userId as string}/>
				</div>

				{/* Analytics Section */}
				<div className="md:col-span-2 h-full md:overflow-scroll">
				<Card className="shadow-lg bg-bg-100/60">
					<CardHeader>
					<CardTitle>Analytics</CardTitle>
					<Tabs className="w-full">
						<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all" active={activeTab === 'all'} onClick={() => {setActiveTab('all'); setPage(1)}}>All</TabsTrigger>
						<TabsTrigger value="bullet" active={activeTab === 'bullet'} onClick={() => {setActiveTab('bullet'); setPage(1)}}>Bullet</TabsTrigger>
						<TabsTrigger value="blitz" active={activeTab === 'blitz'} onClick={() => {setActiveTab('blitz'); setPage(1)}}>Blitz</TabsTrigger>
						<TabsTrigger value="rapid" active={activeTab === 'rapid'} onClick={() => {setActiveTab('rapid'); setPage(1)}}>Rapid</TabsTrigger>
						</TabsList>
						<TabsContent value="all" activeTab={activeTab}>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
							{(['bullet', 'blitz', 'rapid'] as const ).map((format) => (
							<Card key={format} className="shadow">
								<CardHeader className="pb-2">
								<CardTitle className="text-base capitalize">{format}</CardTitle>
								</CardHeader>
								{loadingStats || !stats ? (
									<CardContent className="h-40 flex items-center justify-center">
										<LoadingSpinner/>
									</CardContent>
								):(<CardContent>
									<div className="flex items-center">
										<div className="h-20 w-20">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
											<Pie
												data={getPieData(format)}
												cx="50%"
												cy="50%"
												innerRadius={25}
												outerRadius={35}
												paddingAngle={2}
												dataKey="value"
											>
												{getPieData(format).map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											</PieChart>
										</ResponsiveContainer>
										</div>
										<div className="ml-4">
										<p className="text-sm text-muted-foreground">Win Rate</p>
										<p className="text-2xl font-bold">{getWinRate(format)}%</p>
										<p className="text-xs text-muted-foreground">
											{stats.stats[format].gamesPlayed} games played
										</p>
										</div>
									</div>
								</CardContent>)}
							</Card>
							))}
						</div>

						<div className="mt-2">
							<div className='flex gap-2 items-center mb-3'>
								<h3 className="text-lg font-medium">Rating History</h3>
								<TimeframeDropdown onSelect={selectTimeframe} selectedTimeframe={timeframe}/>
							</div>
							<div className="h-80 w-full">
								{loadingRatingHistory || !ratingHistory ? (
									<div className='flex items-center justify-center h-full w-full'>
										<LoadingSpinner/>
									</div>
								):(<ResponsiveContainer width="100%" height="100%">
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
								</ResponsiveContainer>)}
							</div>
						</div>

						<div className="mt-2">
							<h3 className="text-lg font-medium mb-3">Performance Breakdown</h3>
							<div className="h-64 w-full">
							{loadingAnalytics || !analytics ? (
								<div className='flex items-center justify-center h-full w-full'>
									<LoadingSpinner/>
								</div>
							):
							(<ResponsiveContainer width="100%" height="100%">
								<BarChart 
								data={[
									{ name: 'As white', wins: analytics.colorPerformance.asWhite.wins, losses: analytics.colorPerformance.asWhite.losses, draws: analytics.colorPerformance.asWhite.draws },
									{ name: 'As Black', wins: analytics.colorPerformance.asBlack.wins, losses: analytics.colorPerformance.asBlack.losses, draws: analytics.colorPerformance.asBlack.draws },
								]}
								margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
								<CartesianGrid strokeDasharray="3 3"/>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="wins" name="Wins" fill="#4ade80" />
								<Bar dataKey="losses" name="Losses" fill="#f87171" />
								<Bar dataKey="draws" name="Draws" fill="#a3a3a3" />
								</BarChart>
							</ResponsiveContainer>)}
							</div>
						</div>
						</TabsContent>

						{(['bullet', 'blitz', 'rapid'] as const ).map(format => (
						<TabsContent key={format} value={format} activeTab={activeTab}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								<Card>
									<CardHeader className="pb-2">
									<CardTitle className="text-base">Performance</CardTitle>
									</CardHeader>
									{loadingStats || !stats ? (
										<CardContent className="h-40 flex items-center justify-center">
											<LoadingSpinner/>
										</CardContent>
									):(<CardContent>
									<div className="flex items-center justify-center mb-4">
										<div className="h-40 w-40">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
											<Pie
												data={getPieData(format)}
												cx="50%"
												cy="50%"
												innerRadius={40}
												outerRadius={60}
												paddingAngle={2}
												dataKey="value"
												label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
											>
												{getPieData(format).map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											</PieChart>
										</ResponsiveContainer>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
										<span>Win Rate:</span>
										<span className="font-medium">{getWinRate(format)}%</span>
										</div>
										<div className="flex justify-between">
										<span>Games Played:</span>
										<span className="font-medium">{stats?.stats[format].gamesPlayed}</span>
										</div>
										<div className="flex justify-between">
										<span>Highest Rating:</span>
										<span className="font-medium">{stats?.stats[format].highestRating}</span>
										</div>
										<div className="flex justify-between">
										<span>Lowest Rating:</span>
										<span className="font-medium">{stats?.stats[format].lowestRating}</span>
										</div>
									</div>
									</CardContent>)}
								</Card>

								<Card>
									<CardHeader className="pb-2">
									<CardTitle className="text-base">Rating History</CardTitle>
									</CardHeader>
									<CardContent>
									<div className="h-64 w-full">
									{loadingRatingHistory || !ratingHistory ? (
										<div className='flex items-center justify-center h-full w-full'>
											<LoadingSpinner/>
										</div>
									):(<ResponsiveContainer width="100%" height="100%">
									<LineChart 
										data={ratingHistory[format]}
										margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis domain={['dataMin - 50', 'dataMax + 50']} />
										<Tooltip />
										<Line 
										type="monotone" 
										dataKey="rating"
										stroke="#3b82f6" 
										strokeWidth={2} 
										dot={{ r: 4 }}
										/>
									</LineChart>
									</ResponsiveContainer>)}
									</div>
									</CardContent>
								</Card>
							</div>
							<div className="mt-6">
								<h3 className="text-lg font-medium mb-3">Performance Breakdown</h3>
								<div className="h-64 w-full">
								{loadingAnalytics || !analytics ? (
									<div className='flex items-center justify-center h-full w-full'>
										<LoadingSpinner/>
									</div>
								):
								(<ResponsiveContainer width="100%" height="100%">
									<BarChart 
									data={[
										{ name: 'As white', wins: analytics.colorPerformance.asWhite.wins, losses: analytics.colorPerformance.asWhite.losses, draws: analytics.colorPerformance.asWhite.draws },
										{ name: 'As Black', wins: analytics.colorPerformance.asBlack.wins, losses: analytics.colorPerformance.asBlack.losses, draws: analytics.colorPerformance.asBlack.draws },
									]}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
									>
									<CartesianGrid strokeDasharray="3 3"/>
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="wins" name="Wins" fill="#4ade80" />
									<Bar dataKey="losses" name="Losses" fill="#f87171" />
									<Bar dataKey="draws" name="Draws" fill="#a3a3a3" />
									</BarChart>
								</ResponsiveContainer>)}
							</div>
						</div>
						</TabsContent>
						))}
					</Tabs>
					</CardHeader>
				</Card>

				{/* Game History Section */}
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
			</div>
		</div>
	);
};

export default Profile;