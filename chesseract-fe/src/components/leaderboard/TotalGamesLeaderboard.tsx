import { useState, useEffect } from 'react'
import { getLocalStorage } from '@/utils/localstorage'
import getTopPlayersByGamesPlayed, { TopPlayersByGamesPlayedData } from '@/services/getTopPlayersByTotalGames'
import { countryOptions } from '@/utils/countryFlag'
import Avatar from '../utilities/Avatar'
import useUserRedirection from '@/utils/hooks/userRedirection'

interface GamesPlayedLeaderboardProps {
    title: string
}

const TotalGamesLeaderboard = ({ title }: GamesPlayedLeaderboardProps) => {
    const userId = getLocalStorage('userId')
    const [country, setCountry] = useState<string|null>(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TopPlayersByGamesPlayedData | null>(null)
    const userRouter = useUserRedirection()

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true)
        try {
            const response = await getTopPlayersByGamesPlayed(country)
            if (response.success) {
            setData(response.data)
            }
        } catch (error) {
            console.error("Error fetching games played rankings:", error)
        } finally {
            setLoading(false)
        }
        }
        
        fetchData()
    }, [country])

    const players = data?.topPlayers || []

    return (
        <div className="bg-bg-100/60 rounded-lg shadow-md overflow-hidden w-full h-full">
            <div className="p-4 border-b border-accent-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                
                <select 
                    className="px-3 py-1 rounded-md border border-accent-100 bg-bg-100 text-sm"
                    value={country || ''} 
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
                    {[1, 2, 3].map((i) => (
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
                        <th className="text-right p-2">Games</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, idx) => {
                        const isCurrentUser = player._id === userId
                        
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
                                    <span className="text-blue-500">{player.gamesByFormat.bullet}</span>
                                    {' / '}
                                    <span className="text-green-500">{player.gamesByFormat.blitz}</span>
                                    {' / '}
                                    <span className="text-orange-500">{player.gamesByFormat.rapid}</span>
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td className="p-2 text-right">
                                <span className="font-medium">{player.totalGamesPlayed}</span>
                            </td>
                            </tr>
                        )
                        })}
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

export default TotalGamesLeaderboard