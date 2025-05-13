import { useState, useEffect } from 'react'
import { PuzzleFormats } from '@/models/GameUtilityTypes'
import getTopPlayersByPuzzleScore, { TopPlayersByPuzzleData } from '@/services/getTopPlayersByPuzzle'
import getTopFriendsByPuzzleScore, { TopFriendsByPuzzleData } from '@/services/getTopFriendsByPuzzle'
import { countryOptions } from '@/utils/countryFlag'
import Avatar from '../utilities/Avatar'
import useUserRedirection from '@/utils/hooks/userRedirection'

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
    const userRouter = useUserRedirection()

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
        <div className="bg-bg-100/60 rounded-lg shadow-md overflow-hidden w-full h-full">
            <div className="p-4 border-b border-accent-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                
                <select 
                    className="px-3 py-1 rounded-md border border-accent-100 bg-bg-100"
                    value={country || ""} 
                    onChange={(e) => setCountry(e.target.value)}
                >
                    <option value="">All Countries</option>
                    {countryOptions.map(country => (
                        <option key={country.code} value={country.code}>
                            {country.name} 
                        </option>
                    ))}
                </select>
                </div>
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
                        <tr className="text-accent-200 border-b border-accent-100">
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
                                    <div className="text-xs text-text-200">
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
                            <tr className="border-b border-accent-100">
                            <td colSpan={3} className="py-2 px-4 text-center text-sm">
                                <span className="text-text-100">...</span>
                            </td>
                            </tr>
                            <tr className="bg-bg-300">
                            <td className="p-2 text-left">
                                <div className="flex items-center">
                                <span className="font-medium">{userRank}</span>
                                <span className="ml-2 text-xs py-0.5 px-1.5 border border-accent-100 rounded-full text-text-100">
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
                                    />
                                <div>
                                    <div className="font-medium">{user.username}</div>
                                    <div className="text-xs text-text-200">
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