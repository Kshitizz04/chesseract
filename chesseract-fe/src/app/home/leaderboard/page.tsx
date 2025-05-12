
'use client'

import { useState } from 'react'
import RatingLeaderboard from '@/components/leaderboard/RatingLeaderboard'
import PuzzleLeaderboard from '@/components/leaderboard/PuzzleLeaderboard'
import RatingJumpLeaderboard from '@/components/leaderboard/RatingJumpLeaderboard'
import TotalGamesLeaderboard from '@/components/leaderboard/TotalGamesLeaderboard'

const LeaderBoard = () => {
    const [activeTab, setActiveTab] = useState("global")

    return (
        <div className="h-full w-full p-4 md:p-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Player Rankings</h1>
            
            <div className="mb-6">
                <div className="w-full max-w-md mx-auto grid grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                    <button 
                        onClick={() => setActiveTab('global')}
                        className={`py-2 text-sm font-medium rounded-md transition ${
                            activeTab === 'global' 
                                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Global Rankings
                    </button>
                    <button 
                        onClick={() => setActiveTab('friends')}
                        className={`py-2 text-sm font-medium rounded-md transition ${
                            activeTab === 'friends' 
                                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Friends Rankings
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto">
                {activeTab === 'global' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RatingLeaderboard 
                            title="Top Bullet Players"
                            format="bullet"
                        />
                        
                        <RatingLeaderboard 
                            title="Top Blitz Players"
                            format="blitz"
                        />
                        
                        <RatingLeaderboard 
                            title="Top Rapid Players"
                            format="rapid"
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top Puzzle Survival Players"
                            format="survival"
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top 3-Min Puzzle Players"
                            format="threeMinute"
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top 5-Min Puzzle Players"
                            format="fiveMinute"
                        />
                        
                        <TotalGamesLeaderboard 
                            title="Most Games Played"
                        />
                    </div>
                )}
                
                {activeTab === 'friends' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RatingLeaderboard 
                            title="Top Bullet Friends"
                            format="bullet"
                            isFriendsRanking={true}
                        />
                        
                        <RatingLeaderboard 
                            title="Top Blitz Friends"
                            format="blitz"
                            isFriendsRanking={true}
                        />
                        
                        <RatingLeaderboard 
                            title="Top Rapid Friends"
                            format="rapid"
                            isFriendsRanking={true}
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top Puzzle Survival Friends"
                            format="survival"
                            isFriendsRanking={true}
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top 3-Min Puzzle Friends"
                            format="threeMinute"
                            isFriendsRanking={true}
                        />
                        
                        <PuzzleLeaderboard 
                            title="Top 5-Min Puzzle Friends"
                            format="fiveMinute"
                            isFriendsRanking={true}
                        />
                        
                        <RatingJumpLeaderboard 
                            title="Top Rating Climbers (Last Week)"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeaderBoard