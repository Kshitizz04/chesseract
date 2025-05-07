'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Button from '@/components/utilities/CustomButton';
import { FaUserEdit } from 'react-icons/fa';
import { IoChevronForwardOutline, IoClose } from 'react-icons/io5';
import { BiLinkExternal } from 'react-icons/bi';
import { CiSaveUp2 } from 'react-icons/ci';
import Avatar from '@/components/utilities/Avatar';

type Formats = 'bullet' | 'blitz' | 'rapid';
// Dummy user data
const dummyUser = {
  username: "MagnusCarlsen",
  fullname: "Magnus Carlsen",
  email: "magnus@example.com",
  bio: "Chess enthusiast and casual player. I enjoy tactical positions and endgames.",
  profilePicture: "",
  country: "Norway",
  rating: {
    bullet: 1850,
    blitz: 1920,
    rapid: 2050,
  },
  stats: {
    bullet: {
      wins: 145,
      losses: 98,
      draws: 24,
      gamesPlayed: 267,
      highestRating: 1890,
      lowestRating: 1420,
    },
    blitz: {
      wins: 203,
      losses: 115,
      draws: 39,
      gamesPlayed: 357,
      highestRating: 1950,
      lowestRating: 1580,
    },
    rapid: {
      wins: 98,
      losses: 45,
      draws: 22,
      gamesPlayed: 165,
      highestRating: 2080,
      lowestRating: 1750,
    }
  }
};

// Dummy rating history
const dummyRatingHistory = {
  bullet: [
    { date: '01/01', rating: 1700 },
    { date: '01/15', rating: 1725 },
    { date: '02/01', rating: 1780 },
    { date: '02/15', rating: 1750 },
    { date: '03/01', rating: 1800 },
    { date: '03/15', rating: 1820 },
    { date: '04/01', rating: 1850 },
  ],
  blitz: [
    { date: '01/01', rating: 1800 },
    { date: '01/15', rating: 1850 },
    { date: '02/01', rating: 1880 },
    { date: '02/15', rating: 1900 },
    { date: '03/01', rating: 1870 },
    { date: '03/15', rating: 1910 },
    { date: '04/01', rating: 1920 },
  ],
  rapid: [
    { date: '01/01', rating: 1880 },
    { date: '01/15', rating: 1920 },
    { date: '02/01', rating: 1970 },
    { date: '02/15', rating: 2010 },
    { date: '03/01', rating: 1990 },
    { date: '03/15', rating: 2020 },
    { date: '04/01', rating: 2050 },
  ]
};

// Dummy game history
const dummyGameHistory = {
  bullet: [
    { id: 'b1', opponent: 'Hikaru123', result: 'win', rating: '+8', date: '2025-04-01', moves: 32 },
    { id: 'b2', opponent: 'ChessWizard', result: 'loss', rating: '-12', date: '2025-03-27', moves: 45 },
    { id: 'b3', opponent: 'TacticalPlayer', result: 'win', rating: '+9', date: '2025-03-25', moves: 28 },
    { id: 'b4', opponent: 'GrandMasterFan', result: 'win', rating: '+10', date: '2025-03-20', moves: 35 },
    { id: 'b5', opponent: 'Knight_Rider', result: 'draw', rating: '+0', date: '2025-03-18', moves: 62 },
  ],
  blitz: [
    { id: 'bl1', opponent: 'ChessMaster99', result: 'win', rating: '+7', date: '2025-04-02', moves: 42 },
    { id: 'bl2', opponent: 'RookStar', result: 'win', rating: '+8', date: '2025-03-29', moves: 38 },
    { id: 'bl3', opponent: 'PawnPusher', result: 'draw', rating: '+0', date: '2025-03-28', moves: 56 },
    { id: 'bl4', opponent: 'QueenGambler', result: 'loss', rating: '-10', date: '2025-03-25', moves: 49 },
    { id: 'bl5', opponent: 'BishopRunner', result: 'win', rating: '+9', date: '2025-03-22', moves: 41 },
  ],
  rapid: [
    { id: 'r1', opponent: 'EndGameGuru', result: 'win', rating: '+6', date: '2025-04-01', moves: 62 },
    { id: 'r2', opponent: 'OpeningMaster', result: 'win', rating: '+8', date: '2025-03-28', moves: 54 },
    { id: 'r3', opponent: 'CheckmateMachine', result: 'loss', rating: '-9', date: '2025-03-24', moves: 47 },
    { id: 'r4', opponent: 'StrategicMind', result: 'draw', rating: '+0', date: '2025-03-20', moves: 76 },
    { id: 'r5', opponent: 'TacticalGenius', result: 'win', rating: '+7', date: '2025-03-15', moves: 39 },
  ],
};

const Profile = () => {
	const [editing, setEditing] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState('all');
	const [user, setUser] = useState(dummyUser);
	const [activeTab, setActiveTab] = useState('all');
	const [historyTab, setHistoryTab] = useState('all');

	// User edit form state
	const [editForm, setEditForm] = useState({
		fullname: dummyUser.fullname,
		bio: dummyUser.bio,
		profilePicture: dummyUser.profilePicture,
	});

	const handleEditSubmit = (e: any) => {
		e.preventDefault();
		setUser({
		...user,
		fullname: editForm.fullname,
		bio: editForm.bio,
		profilePicture: editForm.profilePicture,
		});
		setEditing(false);
	};

	// Analytics calculations
	const getWinRate = (format: Formats) => {
		const stats = user.stats[format];
		return stats.gamesPlayed > 0 
		? Math.round((stats.wins / stats.gamesPlayed) * 100) 
		: 0;
	};

	const getPieData = (format: Formats) => [
		{ name: 'Wins', value: user.stats[format].wins, color: '#4ade80' },
		{ name: 'Losses', value: user.stats[format].losses, color: '#f87171' },
		{ name: 'Draws', value: user.stats[format].draws, color: '#a3a3a3' },
	];

	const COLORS = ['#4ade80', '#f87171', '#a3a3a3'];

	return (
		<div className="h-full w-full p-2 rounded-md bg-bg-200 max-md:overflow-scroll">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
				{/* User Profile Card */}
				<div className="md:col-span-1 h-full flex flex-col">
					<Card className="shadow-lg bg-bg-100">
						<CardHeader className="relative pb-0">
						{!editing && (
							<Button
								className="absolute right-4 top-4"
								onClick={() => setEditing(true)}
								width='w-8'
							>
								<FaUserEdit className="h-4 w-4" />
							</Button>
						)}
						<div className="flex flex-col items-center">
							<Avatar
								username={user.username}
								profileImage={user.profilePicture}
								showUsername={false}
								size={80}
							/>
							{editing ? (
							<form onSubmit={handleEditSubmit} className="w-full">
								<div className="space-y-4">
								<div>
									<label className="text-sm font-medium">Profile URL</label>
									<input
									type="text"
									className="w-full p-2 border rounded mt-1"
									value={editForm.profilePicture}
									onChange={(e) => setEditForm({...editForm, profilePicture: e.target.value})}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Full Name</label>
									<input
									type="text"
									className="w-full p-2 border rounded mt-1"
									value={editForm.fullname}
									onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Bio</label>
									<textarea
									className="w-full p-2 border rounded mt-1"
									rows={3}
									value={editForm.bio}
									onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<Button type="button" onClick={() => setEditing(false)}>
									<IoClose className="h-4 w-4 mr-2" /> Cancel
									</Button>
									<Button type="submit">
									<CiSaveUp2 className="h-4 w-4 mr-2" /> Save
									</Button>
								</div>
								</div>
							</form>
							) : (
							<>
								<CardTitle>{user.username}</CardTitle>
								<CardDescription>{user.fullname}</CardDescription>
								<p className="text-sm text-muted-foreground mt-2">{user.country}</p>
								<p className="text-sm mt-4 text-center">{user.bio}</p>
							</>
							)}
						</div>
						</CardHeader>
						<CardContent className="pt-6">
						<div className="grid grid-cols-3 gap-2 text-center">
							<div className="bg-secondary/50 p-3 rounded-lg">
							<p className="text-sm font-medium mb-1">Bullet</p>
							<p className="text-2xl font-bold">{user.rating.bullet}</p>
							</div>
							<div className="bg-secondary/50 p-3 rounded-lg">
							<p className="text-sm font-medium mb-1">Blitz</p>
							<p className="text-2xl font-bold">{user.rating.blitz}</p>
							</div>
							<div className="bg-secondary/50 p-3 rounded-lg">
							<p className="text-sm font-medium mb-1">Rapid</p>
							<p className="text-2xl font-bold">{user.rating.rapid}</p>
							</div>
						</div>
						<div className="mt-4 space-y-2">
							<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Total Games</span>
							<span className="font-medium">
								{user.stats.bullet.gamesPlayed + user.stats.blitz.gamesPlayed + user.stats.rapid.gamesPlayed}
							</span>
							</div>
							<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Member Since</span>
							<span className="font-medium">January 2025</span>
							</div>
						</div>
						</CardContent>
					</Card>
					<Card className="shadow-lg bg-bg-100 mt-6 h-full">
						Friends
					</Card>
				</div>

				{/* Analytics Section */}
				<div className="md:col-span-2 h-full md:overflow-scroll">
				<Card className="shadow-lg bg-bg-100">
					<CardHeader>
					<CardTitle>Analytics</CardTitle>
					<Tabs className="w-full">
						<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all" active={activeTab === 'all'} onClick={() => {setActiveTab('all'); setSelectedFormat("all")}}>All</TabsTrigger>
						<TabsTrigger value="bullet" active={activeTab === 'bullet'} onClick={() => {setActiveTab('bullet'); setSelectedFormat("bullet")}}>Bullet</TabsTrigger>
						<TabsTrigger value="blitz" active={activeTab === 'blitz'} onClick={() => {setActiveTab('blitz'); setSelectedFormat("blitz")}}>Blitz</TabsTrigger>
						<TabsTrigger value="rapid" active={activeTab === 'rapid'} onClick={() => {setActiveTab('rapid'); setSelectedFormat("rapid")}}>Rapid</TabsTrigger>
						</TabsList>
						<TabsContent value="all" activeTab={activeTab}>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
							{(['bullet', 'blitz', 'rapid'] as const ).map((format) => (
							<Card key={format} className="shadow">
								<CardHeader className="pb-2">
								<CardTitle className="text-base capitalize">{format}</CardTitle>
								</CardHeader>
								<CardContent>
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
										{user.stats[format].gamesPlayed} games played
									</p>
									</div>
								</div>
								</CardContent>
							</Card>
							))}
						</div>

						<div className="mt-6">
							<h3 className="text-lg font-medium mb-3">Rating History</h3>
							<div className="h-80 w-full">
							<ResponsiveContainer width="100%" height="100%">
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
									data={dummyRatingHistory.bullet} 
									stroke="#ff6b6b" 
									strokeWidth={2} 
								/>
								<Line 
									type="monotone" 
									dataKey="rating" 
									name="Blitz" 
									data={dummyRatingHistory.blitz} 
									stroke="#4dabf7" 
									strokeWidth={2} 
								/>
								<Line 
									type="monotone" 
									dataKey="rating" 
									name="Rapid" 
									data={dummyRatingHistory.rapid} 
									stroke="#40c057" 
									strokeWidth={2} 
								/>
								</LineChart>
							</ResponsiveContainer>
							</div>
						</div>

						<div className="mt-6">
							<h3 className="text-lg font-medium mb-3">Performance Breakdown</h3>
							<div className="h-64 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart 
								data={[
									{ name: 'Bullet', wins: user.stats.bullet.wins, losses: user.stats.bullet.losses, draws: user.stats.bullet.draws },
									{ name: 'Blitz', wins: user.stats.blitz.wins, losses: user.stats.blitz.losses, draws: user.stats.blitz.draws },
									{ name: 'Rapid', wins: user.stats.rapid.wins, losses: user.stats.rapid.losses, draws: user.stats.rapid.draws },
								]}
								margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="wins" name="Wins" fill="#4ade80" />
								<Bar dataKey="losses" name="Losses" fill="#f87171" />
								<Bar dataKey="draws" name="Draws" fill="#a3a3a3" />
								</BarChart>
							</ResponsiveContainer>
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
								<CardContent>
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
									<span className="font-medium">{user.stats[format].gamesPlayed}</span>
									</div>
									<div className="flex justify-between">
									<span>Highest Rating:</span>
									<span className="font-medium">{user.stats[format].highestRating}</span>
									</div>
									<div className="flex justify-between">
									<span>Lowest Rating:</span>
									<span className="font-medium">{user.stats[format].lowestRating}</span>
									</div>
								</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
								<CardTitle className="text-base">Rating History</CardTitle>
								</CardHeader>
								<CardContent>
								<div className="h-64 w-full">
									<ResponsiveContainer width="100%" height="100%">
									<LineChart 
										data={dummyRatingHistory[format]}
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
									</ResponsiveContainer>
								</div>
								</CardContent>
							</Card>
							</div>
						</TabsContent>
						))}
					</Tabs>
					</CardHeader>
				</Card>

				{/* Game History Section */}
				<Card className="shadow-lg mt-6 bg-bg-100">
					<CardHeader>
					<CardTitle>Game History</CardTitle>
					<Tabs className="w-full">
						<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all" active={historyTab === 'all'} onClick={()=>{setHistoryTab("all"); setSelectedFormat("all")}}>All</TabsTrigger>
						<TabsTrigger value="bullet" active={historyTab === 'bullet'}  onClick={()=>{setHistoryTab("bullet"); setSelectedFormat("bullet")}}>Bullet</TabsTrigger>
						<TabsTrigger value="blitz" active={historyTab === 'blitz'}  onClick={()=>{setHistoryTab("blitz"); setSelectedFormat("blitz")}}>Blitz</TabsTrigger>
						<TabsTrigger value="rapid" active={historyTab === 'rapid'}  onClick={()=>{setHistoryTab("rapid"); setSelectedFormat("rapid")}}>Rapid</TabsTrigger>
						</TabsList>
						
						<TabsContent value="all" activeTab={historyTab}>
						<div className="space-y-2 mt-2">
							{[...dummyGameHistory.bullet, ...dummyGameHistory.blitz, ...dummyGameHistory.rapid]
							.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
							.slice(0, 8)
							.map(game => (
								<GameHistoryItem key={game.id} game={game} />
							))}
						</div>
						</TabsContent>

						{(['bullet', 'blitz', 'rapid'] as const).map(format => (
						<TabsContent key={format} value={format} activeTab={historyTab}>
							<div className="space-y-2 mt-2">
							{dummyGameHistory[format].map(game => (
								<GameHistoryItem key={game.id} game={game} />
							))}
							</div>
						</TabsContent>
						))}
					</Tabs>
					</CardHeader>
				</Card>
				</div>
			</div>
		</div>
	);
};

// Game history item component
const GameHistoryItem = ({ game }: any) => {
	const resultColor = game.result === 'win' 
		? 'text-green-500' 
		: game.result === 'loss' 
		? 'text-red-500' 
		: 'text-gray-500';

	const ratingColor = game.rating.startsWith('+') 
		? 'text-green-500' 
		: game.rating.startsWith('-') 
		? 'text-red-500' 
		: 'text-gray-500';

  return (
		<Dialog>
		<DialogTrigger asChild>
			<div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors">
			<div className="flex items-center">
				<div className={`w-2 h-8 rounded-full mr-3 ${resultColor.replace('text-', 'bg-')}`} />
				<div>
				<p className="font-medium">vs {game.opponent}</p>
				<p className="text-xs text-muted-foreground">
					{new Date(game.date).toLocaleDateString()} • {game.moves} moves
				</p>
				</div>
			</div>
			<div className="flex items-center space-x-3">
				<span className={`font-medium ${resultColor}`}>
				{game.result.charAt(0).toUpperCase() + game.result.slice(1)}
				</span>
				<span className={`text-sm ${ratingColor}`}>{game.rating}</span>
				<IoChevronForwardOutline className="h-4 w-4 text-muted-foreground" />
			</div>
			</div>
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
			<DialogTitle>Game Details</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div>
				<p className="text-sm text-muted-foreground">Date</p>
				<p>{new Date(game.date).toLocaleDateString()}</p>
				</div>
				<div>
				<p className="text-sm text-muted-foreground">Result</p>
				<p className={resultColor}>
					{game.result.charAt(0).toUpperCase() + game.result.slice(1)}
					<span className={`ml-2 ${ratingColor}`}>{game.rating}</span>
				</p>
				</div>
				<div>
				<p className="text-sm text-muted-foreground">Opponent</p>
				<p>{game.opponent}</p>
				</div>
				<div>
				<p className="text-sm text-muted-foreground">Moves</p>
				<p>{game.moves}</p>
				</div>
			</div>
			<div className="flex justify-center">
				<Button>
				<BiLinkExternal className="h-4 w-4 mr-2" />
				View Full Game
				</Button>
			</div>
			</div>
		</DialogContent>
		</Dialog>
	);
};

export default Profile;