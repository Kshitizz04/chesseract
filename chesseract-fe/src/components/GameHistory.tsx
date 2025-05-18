import { GameInHistory, GetGameHistoryData } from "@/services/getUserGames";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { IoChevronForwardOutline } from "react-icons/io5";
import Button from "./utilities/CustomButton";
import { BiLinkExternal } from "react-icons/bi";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import LoadingSpinner from "./utilities/LoadingSpinner";
import { MdFirstPage, MdLastPage, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
interface GameHistoryProps {
    historyTab: string;
    setHistoryTab: (tab: string) => void;
    gameHistory: GetGameHistoryData | null;
    loadingGameHistory: boolean;
    page: number;
    setPage: (page: number) => void;
    userId: string;
}

const GameHistory = ({historyTab, setHistoryTab, gameHistory, loadingGameHistory, page, setPage, userId}: GameHistoryProps)=>{
    return(
        <Card className="shadow-lg mt-2 bg-bg-100/60">
            <CardHeader>
                <CardTitle>Game History</CardTitle>
                <Tabs className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" active={historyTab === 'all'} onClick={()=>{setHistoryTab("all")}}>All</TabsTrigger>
                    <TabsTrigger value="bullet" active={historyTab === 'bullet'}  onClick={()=>{setHistoryTab("bullet")}}>Bullet</TabsTrigger>
                    <TabsTrigger value="blitz" active={historyTab === 'blitz'}  onClick={()=>{setHistoryTab("blitz")}}>Blitz</TabsTrigger>
                    <TabsTrigger value="rapid" active={historyTab === 'rapid'}  onClick={()=>{setHistoryTab("rapid")}}>Rapid</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={historyTab} activeTab={historyTab}>
                    {loadingGameHistory || !gameHistory ? (
                        <div className='w-full h-96 flex items-center justify-center'>
                            <LoadingSpinner/>
                        </div>
                    ) : gameHistory.games.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {gameHistory.games.map(game => (
                                <GameHistoryItem key={game._id} game={game} userId={userId as string}/>
                            ))}
                            <div className="flex items-center justify-center space-x-2 p-4">
                                <Button
                                    width='w-8'
                                    onClick={() => setPage(1)}
                                >
                                    <MdFirstPage />
                                </Button>
                                <Button
                                    width='w-8'
                                    onClick={() => {if(page>1)setPage(page - 1)}}
                                >
                                    <MdNavigateBefore />
                                </Button>
                                <p>{page}</p>
                                <Button
                                    width='w-8'
                                    onClick={() => {if(gameHistory.pagination.totalPages>page)setPage(page + 1)}}
                                >
                                    <MdNavigateNext />
                                </Button>
                                <Button
                                    width='w-8'
                                    onClick={() => setPage(gameHistory.pagination.totalPages)}
                                >
                                    <MdLastPage />
                                </Button>
                            </div>
                        </div>
                    ) : (
						<div className='w-full h-96 flex items-center justify-center'>
							<p className="text-muted-foreground">No games found</p>
						</div>
					)}
                    </TabsContent>
                </Tabs>
            </CardHeader>
        </Card>
    )
}

const GameHistoryItem = ({game, userId}: {game: GameInHistory, userId: string}) => {
	let resultColor;
	let result;
	let opponent;
	if(game.whitePlayer._id === userId){
		resultColor = game.winner === 'white' ? 'text-green-500' : game.winner === 'black' ? 'text-red-500' : 'text-gray-500';
		result = game.winner === 'white' ? 'Won' : game.winner === 'black' ? 'Lost' : 'Draw';
		opponent = game.blackPlayer.username;
	}else{
		resultColor = game.winner === 'black' ? 'text-green-500' : game.winner === 'white' ? 'text-red-500' : 'text-gray-500';
		result = game.winner === 'black' ? 'Won' : game.winner === 'white' ? 'Lost' : 'Draw';
		opponent = game.whitePlayer.username;
	}

  return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors">
				<div className="flex items-center">
					<div className={`w-2 h-8 rounded-full mr-3 ${resultColor.replace('text-', 'bg-')}`} />
					<div>
					<p className="font-medium">{game.whitePlayer.username} vs {game.blackPlayer.username}</p>
					<p className="text-xs text-muted-foreground">
						{game.createdAt.slice(0,10)} • {game.moves.length} moves
					</p>
					</div>
				</div>
				<div className="flex items-center space-x-3">
					<span className={`font-medium ${resultColor}`}>
					{result}
					</span>
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
					<p>{game.createdAt.slice(0,10)}</p>
					</div>
					<div>
					<p className="text-sm text-muted-foreground">Result</p>
					<p className={resultColor}>
						{result}
					</p>
					</div>
					<div>
					<p className="text-sm text-muted-foreground">Opponent</p>
					<p>{opponent}</p>
					</div>
					<div>
					<p className="text-sm text-muted-foreground">Moves</p>
					<p>{game.moves.length}</p>
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

export default GameHistory;