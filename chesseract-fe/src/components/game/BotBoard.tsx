import { useLayout } from '@/contexts/useLayout';
import { ChessEngine } from '@/Engine';
import { boardColors } from '@/models/BoardStyleData';
import { Chess } from 'chess.js';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, Square } from 'react-chessboard/dist/chessboard/types';

interface BotBoardProps {
    position: string;
    setPosition:Dispatch<SetStateAction<string>>
    chess: Chess;
    setResult: (result: 0 | 1 | 2, message: string) => void;
    myColor: "w" | "b";
    difficulty?: string;
    gameStarted: boolean;
    isViewingHistory?: boolean;
    historyFen?: string;
    size: number;
}
 
const BotBoard = ({position, setPosition, chess, setResult, myColor, difficulty="easy", gameStarted, isViewingHistory, historyFen, size}:BotBoardProps) => {
    const [optionSquares,setOptionSquares]=useState({})
    const [isMyTurn, setIsMyTurn] = useState(myColor === "w")
    const {boardStyle} = useLayout();
    const boardColor = boardColors[boardStyle.style];

    const chessEngine = useMemo(() => new ChessEngine(), []);
    const difficultyToSkillLevel = {
        "easy": 1,
        "medium": 3,
        "hard": 5,
        "extreme": 10
    };

    useEffect(() => {
        const skillLevel = difficultyToSkillLevel[difficulty as keyof typeof difficultyToSkillLevel] || 10;
        chessEngine.setSkillLevel(skillLevel);
    }, [difficulty]);

    useEffect(()=>{
        setIsMyTurn(myColor === chess.turn())
    }, [position, myColor])

    useEffect(()=>{
        if(!isMyTurn && gameStarted){
            setTimeout(() => {
                findBestMove();
            }, 1500);
        }
    },[isMyTurn, gameStarted])

    async function findBestMove() {
        try {
            // Get the best move from our engine service
            const bestMoveInfo = await chessEngine.findBestMove(chess.fen(), 1000);
            
            // Make the move on the board
            try {
                chess.move({ 
                    from: bestMoveInfo.from as Square, 
                    to: bestMoveInfo.to as Square,
                    promotion: bestMoveInfo.promotion
                });
                
                setPosition(chess.fen());
                
                // Check if game is over
                if (chess.isGameOver()) {
                    if (chess.isThreefoldRepetition() || chess.isStalemate() || chess.isInsufficientMaterial()) {
                        setResult(2, "draw");
                    }
                    if (chess.isCheckmate()) {
                        setResult(0, "You lost by checkmate");
                    }
                }
            } catch (error) {
                console.error("Invalid move suggested by engine:", error);
            }
        } catch (error) {
            console.error("Error finding best move:", error);
        }
    }

    // Example function to show position evaluation
    // async function showPositionEvaluation() {
    //     const evaluation = await chessEngine.evaluatePosition(chess.fen());
        
    //     // Display the evaluation to the user
    //     console.log(`Position evaluation: ${evaluation.score / 100} pawns`); 
    //     // Positive is good for White, negative is good for Black
        
    //     if (evaluation.isMate) {
    //         console.log(`Mate in ${Math.abs(evaluation.score)} moves`);
    //     }
    // }

    // Example function to get alternative moves
    // async function showAlternativeMoves() {
    //     // Get top 5 moves
    //     const movesAnalysis = await chessEngine.analyzeMultipleMoves(chess.fen(), 5);
        
    //     // Display them to the user
    //     movesAnalysis.forEach((analysis, index) => {
    //         console.log(`Move ${index + 1}: ${analysis.move} (Score: ${analysis.score / 100})`);
    //     });
    // }

    // // Example function to get both top and second-best variations
    // async function analyzeTwoMainLines() {
    //     const { topMoves, secondBestMoves } = await chessEngine.getTopAndSecondBestMoves(chess.fen(), 5);
        
    //     console.log("Top variation:");
    //     topMoves.forEach((move, i) => console.log(`${i+1}. ${move.move} (${move.score/100})`));
        
    //     console.log("Second-best variation:");
    //     secondBestMoves.forEach((move, i) => console.log(`${i+1}. ${move.move} (${move.score/100})`));
    // }

    const handleDrop = (source:Square,target:Square,piece:Piece)=>{
        if(myColor !== piece.charAt(0).toLowerCase()){
            return false;
        }
        setOptionSquares({})
        try{
            chess.move({from:source,to: target});
            if(chess.isGameOver()){
                if(chess.isThreefoldRepetition() || chess.isStalemate() || chess.isInsufficientMaterial()){
                    setResult(2, "draw")
                }
                if(chess.isCheckmate()){
                    if(chess.turn()===myColor){
                        setResult(1, "Opponent won by checkmate")
                    }
                    else setResult(0, "You won by checkmate!!")
                }
            }
            setPosition(chess.fen())
            return true;
        }catch(e){ 
            console.log("Invalid move",e)
            return false;
        }
    }

    const handleClick = (square:Square)=>{
        const piece = chess.get(square);
        if(!piece || myColor !== piece.color){
            return false;
        }
        console.log("handle click", square)
    }

    return ( 
        <div    
            className={`w-full h-max md:h-full md:w-max ${(!gameStarted || isViewingHistory) && 'pointer-events-none'}`} 
            style={{
                width: size-112,
                height: size-112,
            }}
        >
            <Chessboard 
                id="standard-board"
                position={isViewingHistory ? historyFen : position}
                onPieceDrop={handleDrop}
                onSquareClick={handleClick}
                customDarkSquareStyle={boardColor.dark}
                customLightSquareStyle={boardColor.light}
                customSquareStyles={boardStyle.showLegalMoves ? {...optionSquares} : {}}
                animationDuration={100}
                arePremovesAllowed={true}
                showBoardNotation={boardStyle.showCoordinates}
                boardOrientation={myColor === "w" ? "white" : "black"}
            />
        </div>
    );
}
 
export default BotBoard;