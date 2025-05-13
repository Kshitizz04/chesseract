'use client'

import { useState, useEffect } from 'react'
import { getLocalStorage } from '@/utils/localstorage'
import getTopFriendsByRatingJump, { TopFriendsByRatingJumpData } from '@/services/getTopFriendsByJump'
import Avatar from '../utilities/Avatar'
import useUserRedirection from '@/utils/hooks/userRedirection'

interface RatingJumpLeaderboardProps {
    title: string
}

const RatingJumpLeaderboard = ({ title }: RatingJumpLeaderboardProps) => {
    const userId = getLocalStorage('userId')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TopFriendsByRatingJumpData | null>(null)
    const userRouter = useUserRedirection()

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true)
        try {
            const response = await getTopFriendsByRatingJump()
            if (response.success) {
            setData(response.data)
            }
        } catch (error) {
            console.error("Error fetching rating jump rankings:", error)
        } finally {
            setLoading(false)
        }
        }
        
        fetchData()
    }, [])

    const players = data?.topFriends || []
    const userRank = data?.userRank
    const user = data?.userData

    return (
        <div className="bg-bg-100/60 rounded-lg shadow-md overflow-hidden w-full h-full">
            <div className="p-4 border-b border-accent-100">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            
            <div className="p-4">
                {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-full h-12 bg-bg-300 rounded animate-pulse"></div>
                    ))}
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                        <tr className="text-accent-100 border-b border-accent-100">
                        <th className="text-left p-2 w-12">Rank</th>
                        <th className="text-left p-2">Player</th>
                        <th className="text-right p-2">Rating Jump</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, idx) => {
                        const isCurrentUser = player._id === userId
                        const ratingJump = player.ratingJumps.total
                        
                        return (
                            <tr 
                            key={player._id} 
                            className={`border-b border-accent-100 last:border-b-0 ${
                                isCurrentUser ? 'bg-bg-300' : ''
                            }`}
                            >
                            <td className="p-2 text-left">
                                <div className="flex items-center">
                                <span className="font-medium">{idx + 1}</span>
                                {isCurrentUser && (
                                    <span className="ml-2 text-xs py-0.5 px-1.5 border border-accent-200 rounded-full text-text-100">
                                    You
                                    </span>
                                )}
                                </div>
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        profileImage={player.profilePicture}
                                        username={player.username}
                                        showUsername={false}
                                        size={42}
                                        onClick={() => userRouter(player._id, `/home/user/${player._id}`)}
                                    />
                                <div>
                                    <div className="font-medium">{player.username}</div>
                                    <div className="text-xs">
                                    <span className="text-blue-500">+{player.ratingJumps.bullet}</span>
                                    {' / '}
                                    <span className="text-green-500">+{player.ratingJumps.blitz}</span>
                                    {' / '}
                                    <span className="text-orange-500">+{player.ratingJumps.rapid}</span>
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td className="p-2 text-right">
                                <span className={`font-medium ${ratingJump > 0 ? 'text-green-500' : ''}`}>
                                {ratingJump > 0 ? `+${ratingJump}` : ratingJump}
                                </span>
                            </td>
                            </tr>
                        )
                        })}
                        
                        {userRank && userRank > players.length && user && (
                        <>
                            <tr className="border-b border-accent-100">
                            <td colSpan={3} className="py-2 px-4 text-center text-sm">
                                <span className="text-text-100">...</span>
                            </td>
                            </tr>
                            <tr className="bg-bg-300">
                            <td className="p-2 text-left">
                                <div className="flex items-center">
                                <span className="font-medium">{userRank}</span>
                                <span className="ml-2 text-xs py-0.5 px-1.5 border border-accent-100 rounded-full">
                                    You
                                </span>
                                </div>
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        profileImage={user.profilePicture}
                                        username={user.username}
                                        showUsername={false}
                                        size={42}
                                        onClick={() => userRouter(user._id, `/home/user/${user._id}`)}
                                    />
                                <div>
                                    <div className="font-medium">{user.username}</div>
                                    <div className="text-xs text-text-200">{user.country || "Unknown"}</div>
                                </div>
                                </div>
                            </td>
                            <td className="p-2 text-right">
                                <span className="font-medium">
                                {data?.userData?.ratingJumps.total || 0}
                                </span>
                            </td>
                            </tr>
                        </>
                        )}
                    </tbody>
                    </table>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    <span className="text-blue-500">Bullet</span>
                    {' / '}
                    <span className="text-green-500">Blitz</span>
                    {' / '}
                    <span className="text-orange-500">Rapid</span>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}

export default RatingJumpLeaderboard