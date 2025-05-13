
'use client'

import { useState } from 'react'
import RatingLeaderboard from '@/components/leaderboard/RatingLeaderboard'
import PuzzleLeaderboard from '@/components/leaderboard/PuzzleLeaderboard'
import RatingJumpLeaderboard from '@/components/leaderboard/RatingJumpLeaderboard'
import TotalGamesLeaderboard from '@/components/leaderboard/TotalGamesLeaderboard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const LeaderBoard = () => {
    const [activeTab, setActiveTab] = useState("global")

    return (
        <div className="h-full w-full p-4 md:p-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Player Rankings</h1>
            <Tabs className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Global Rankings" active={activeTab === 'global'} onClick={()=>{setActiveTab("global")}}>Global Rankings</TabsTrigger>
                    <TabsTrigger value="Friends Rankings" active={activeTab === 'friends'}  onClick={()=>{setActiveTab("friends")}}>Friends Rankings</TabsTrigger>
                </TabsList>
            </Tabs>
            
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