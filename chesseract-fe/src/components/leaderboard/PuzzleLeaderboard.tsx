import { useState, useEffect } from 'react'
import { PuzzleFormats } from '@/models/GameUtilityTypes'
import Image from 'next/image'
import getTopPlayersByPuzzleScore, { TopPlayersByPuzzleData } from '@/services/getTopPlayersByPuzzle'
import getTopFriendsByPuzzleScore, { TopFriendsByPuzzleData } from '@/services/getTopFriendsByPuzzle'

interface PuzzleLeaderboardProps {
    title: string
    format: PuzzleFormats
    isFriendsRanking?: boolean
}

const PuzzleLeaderboard = ({ 
    title, 
    format,
    isFriendsRanking = false 
}: PuzzleLeaderboardProps) => {
    const [country, setCountry] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TopPlayersByPuzzleData | TopFriendsByPuzzleData | null>(null)

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true)
        try {
            let response;
            
            if (isFriendsRanking) {
            response = await getTopFriendsByPuzzleScore(format, country)
            } else {
            response = await getTopPlayersByPuzzleScore(format, country)
            }
            
            if (response.success) {
            setData(response.data)
            }
        } catch (error) {
            console.error(`Error fetching ${format} puzzle rankings:`, error)
        } finally {
            setLoading(false)
        }
        }
        
        fetchData()
    }, [format, country, isFriendsRanking])

    // Determine the players array to use based on data structure
    const players = data ? (
        isFriendsRanking 
        ? (data as TopFriendsByPuzzleData).topFriends 
        : (data as TopPlayersByPuzzleData).topPlayers
    ) : []

    const userRank = data ? (
        isFriendsRanking 
        ? (data as TopFriendsByPuzzleData).userRank 
        : (data as TopPlayersByPuzzleData).userRank
    ) : null

    const user = data ? (
        isFriendsRanking 
        ? (data as TopFriendsByPuzzleData).userData 
        : (data as TopPlayersByPuzzleData).userData
    ) : null

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                
                <select 
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                    value={country || ""} 
                    onChange={(e) => setCountry(e.target.value)}
                >
                    <option value="">All Countries</option>
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="UK">United Kingdom</option>
                </select>
                </div>
            </div>
            
            <div className="p-4">
                {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 w-12">Rank</th>
                        <th className="text-left p-2">Player</th>
                        <th className="text-right p-2">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, idx) => {
                        const score = player.puzzleScores?.[format] || 0
                        const isCurrentUser = player._id === user?._id
                        
                        return (
                            <tr 
                            key={player._id} 
                            className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                                isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            >
                            <td className="p-2 text-left">
                                <div className="flex items-center">
                                <span className="font-medium">{idx + 1}</span>
                                {isCurrentUser && (
                                    <span className="ml-2 text-xs py-0.5 px-1.5 border border-blue-300 dark:border-blue-700 rounded-full text-blue-800 dark:text-blue-300">
                                    You
                                    </span>
                                )}
                                </div>
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                                    {player.profilePicture ? (
                                    <Image
                                        src={player.profilePicture}
                                        alt={player.username}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                    />
                                    ) : (
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                                        {player.username.slice(0, 2).toUpperCase()}
                                    </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">{player.username}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {player.country || "Unknown"}
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td className="p-2 text-right">
                                <span className="font-medium">{score}</span>
                            </td>
                            </tr>
                        )
                        })}
                        
                        {userRank && userRank > players.length && user && (
                        <>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                            <td colSpan={3} className="py-2 px-4 text-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">...</span>
                            </td>
                            </tr>
                            <tr className="bg-blue-50 dark:bg-blue-900/20">
                            <td className="p-2 text-left">
                                <div className="flex items-center">
                                <span className="font-medium">{userRank}</span>
                                <span className="ml-2 text-xs py-0.5 px-1.5 border border-blue-300 dark:border-blue-700 rounded-full text-blue-800 dark:text-blue-300">
                                    You
                                </span>
                                </div>
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                                    {user.profilePicture ? (
                                    <Image
                                        src={user.profilePicture}
                                        alt={user.username}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                    />
                                    ) : (
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                                        {user.username.slice(0, 2).toUpperCase()}
                                    </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">{user.username}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.country || "Unknown"}
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td className="p-2 text-right">
                                <span className="font-medium">{user.puzzleScores?.[format] || 0}</span>
                            </td>
                            </tr>
                        </>
                        )}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
    )
}

export default PuzzleLeaderboard