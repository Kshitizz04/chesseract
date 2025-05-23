import { useLayout } from '@/contexts/useLayout';
import { ChessEngine } from '@/Engine';
import { boardColors } from '@/models/BoardStyleData';
import { Chess } from 'chess.js';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, PromotionPieceOption, Square } from 'react-chessboard/dist/chessboard/types';

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
    const [isMyTurn, setIsMyTurn] = useState(myColor === "w")
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [moveSquares, setMoveSquares] = useState({});
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionToSquare, setPromotionToSquare] = useState<Square | null>(null);


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
            }, 50);
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

                const highlightSquares = {
                    [bestMoveInfo.from]: boardColor.lastMove,
                    [bestMoveInfo.to]: boardColor.lastMove
                };
                setMoveSquares(highlightSquares);
                setMoveFrom(null);
                setMoveTo(null);
                setOptionSquares({});
                setPromotionToSquare(null);
                
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
        if(myColor !== piece[0]){
            return false;
        }

        if (piece[0] === "w" && piece[1] === "P" && target[1] === "8" || piece[0] === "b" && piece[1] === "P" && target[1] === "1") {
            setPromotionToSquare(target);
            setShowPromotionDialog(true);
            return false;
        }
        
        try{
            chess.move({
                from: source,
                to: target,
                promotion: piece[1].toLowerCase() || "q" // Always promote to queen for simplicity
            });
            setPosition(chess.fen())
            const highlightSquares = {
                [source]: boardColor.lastMove,
                [target]: boardColor.lastMove
            };
            setMoveSquares(highlightSquares);
            setOptionSquares({});
            setMoveFrom(null);
            setMoveTo(null);
            setPromotionToSquare(null);

            checkGameOver();
            return true;
        }catch(e){ 
            console.log("Invalid move",e)
            setMoveFrom(null);
            setMoveTo(null);
            setOptionSquares({});
            setPromotionToSquare(null);
            return false;
        }
    }

    const handleClick = (square: Square) => {
            // Don't allow moves if not player's turn in online mode
            if (!gameStarted || isViewingHistory || chess.turn()!==myColor) return false;
            
            // Check if we already selected a piece to move
            if (!moveFrom) {
                const piece = chess.get(square);
                if (piece && piece.color === myColor) {                                               
                    setMoveFrom(square);
                    setMoveTo(null);
                    highlightOptionSquares(square);
                }
                return false;
            } 
    
            if(!moveTo){
                const moves = chess.moves({
                    square: moveFrom,
                    verbose: true
                });
                const foundMove = moves.find(m => m.from === moveFrom && m.to === square);
                if(!foundMove){
                    const piece = chess.get(square);
                    if (piece && piece.color === myColor) {                                       
                        setMoveFrom(square);
                        highlightOptionSquares(square);
                    } else{
                        setMoveFrom(null);
                        setMoveTo(null);
                        setOptionSquares({});
                    }
                    return false;
                }
    
                setMoveTo(square);
                if (foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8" || foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1") {
                    setPromotionToSquare(square);
                    setShowPromotionDialog(true);
                    return false;
                }
    
                try{
                    const move = chess.move({
                        from: moveFrom,
                        to: square,
                        promotion: 'q'
                    })
                    if(move){
                        setPosition(chess.fen());
                        
                        // Highlight the move
                        const highlightSquares = {
                            [moveFrom]: boardColor.lastMove,
                            [square]: boardColor.lastMove
                        };
                        setMoveSquares(highlightSquares);
                        setMoveFrom(null);
                        setMoveTo(null);
                        setOptionSquares({});
                        
                        // Check if game is over after move
                        checkGameOver();
                        
                        return true;
                    }
                    return false;
                }catch(error){
                    console.log("Error making move:", error);
                    const piece = chess.get(square);
                    if (piece && piece.color === myColor) {                                       
                        setMoveFrom(square);
                        setMoveTo(null);
                        highlightOptionSquares(square);
                    }
                    return false;
                }
            }
        }
    
        const handlePromotionPieceSelection = (piece: PromotionPieceOption | undefined, promoteFromSquare: Square | undefined, promotToSquare: Square | undefined) => {
            const from = promoteFromSquare || moveFrom;
            const to = promotToSquare || moveTo;
            if(piece && from && to){
                try{
                    const move = chess.move({
                        from,
                        to,
                        promotion: piece[1].toLowerCase() as 'q' | 'n' | 'r' | 'b' || "q"
                    })
                    if(move){
                        setPosition(chess.fen());
                        
                        // Highlight the move
                        const highlightSquares = {
                            [from]: boardColor.lastMove,
                            [to]: boardColor.lastMove
                        };
                        setMoveSquares(highlightSquares);
                        setMoveFrom(null);
                        setMoveTo(null);
                        setOptionSquares({});
                        
                        // Check if game is over after move
                        checkGameOver();
                        setShowPromotionDialog(false);
                        return true;
                    }
                    setShowPromotionDialog(false);
                    return false;
                }catch(error){
                    console.log("Error making move:", error);
                    setMoveFrom(null);
                    setMoveTo(null);
                    setOptionSquares({});
                    setShowPromotionDialog(false);
                    return false;
                }
            }
            else{
                console.log("Could not make move, From or To is null");
                setMoveFrom(null);
                setMoveTo(null);
                setOptionSquares({});
                setShowPromotionDialog(false);
                return false;
            }
    
        }
    
        const highlightOptionSquares = (square: Square)=>{
            const validMoves = getValidMoves(square);
            const newOptionSquares: Record<string, React.CSSProperties> = {};
    
            newOptionSquares[square] = boardColor.lastMove;
    
            validMoves.forEach(move => {
                newOptionSquares[move] = boardColor.optionSquares;
                
                const pieceOnTarget = chess.get(move);
                if (pieceOnTarget) {
                    newOptionSquares[move] = boardColor.capture;
                }
            });
            
            setOptionSquares(newOptionSquares);
        }

    const getValidMoves = (square: Square): Square[] => {
        const moves = chess.moves({
            square,
            verbose: true
        });
        return moves.map(move => move.to as Square);
    };

    const checkGameOver = () => {
        // Check for checkmate
        if (chess.isCheckmate()) {
            setResult(chess.turn() === myColor ? 0 : 1, 'Checkmate!');

            setOptionSquares({});
            setMoveSquares({});
            setMoveFrom(null);
            setMoveTo(null);
            return true;
        }
        
        // Check for draw conditions
        if (chess.isDraw()) {
            const reason = chess.isStalemate() ? 'Stalemate' : 
                            chess.isInsufficientMaterial() ? 'Insufficient material' : 
                            chess.isThreefoldRepetition() ? 'Threefold repetition' : 
                            'Fifty-move rule';
            
            setResult(0, `Draw: ${reason}`);
            
            setOptionSquares({});
            setMoveSquares({});
            setMoveFrom(null);
            setMoveTo(null);
            return true;
        }
        
        return false;
    };

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
                onPromotionPieceSelect={handlePromotionPieceSelection}
                showPromotionDialog={showPromotionDialog}
                promotionToSquare={promotionToSquare}
                customDarkSquareStyle={boardColor.dark}
                customLightSquareStyle={boardColor.light}
                customSquareStyles={boardStyle.showLegalMoves ? {...optionSquares, ...moveSquares} : {...moveSquares}}
                customPremoveDarkSquareStyle={boardColor.premoveDark}
                customPremoveLightSquareStyle={boardColor.premoveLight}
                animationDuration={100}
                arePremovesAllowed={true}
                showBoardNotation={boardStyle.showCoordinates}
                boardOrientation={myColor === "w" ? "white" : "black"}
                promotionDialogVariant='default'
            />
        </div>
    );
}
 
export default BotBoard;