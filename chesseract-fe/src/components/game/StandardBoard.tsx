import { Chess } from 'chess.js';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, PromotionPieceOption, Square } from 'react-chessboard/dist/chessboard/types';
import SocketService from '@/SocketService';
import { boardColors } from '@/models/BoardStyleData';
import { useLayout } from '@/contexts/useLayout';

interface StandardBoardProps {
    position: string;
    setPosition: Dispatch<SetStateAction<string>>;
    chess: Chess;
    setResult: (result: 0 | 1 | 2, message: string) => void;
    gameStarted: boolean;
    isViewingHistory?: boolean;
    historyFen?: string;
    gameId?: string | null;
    playerColor?: "w" | "b";
    setIsMyTurn?: Dispatch<SetStateAction<boolean>>;
    size: number;
}
 
const StandardBoard = ({
    position, 
    setPosition, 
    chess, 
    setResult, 
    gameStarted, 
    isViewingHistory = false, 
    historyFen = "", 
    gameId = null,
    playerColor,
    setIsMyTurn = () => {},
    size
}: StandardBoardProps) => {
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [moveSquares, setMoveSquares] = useState({});
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionToSquare, setPromotionToSquare] = useState<Square | null>(null);

    const {boardStyle} = useLayout();
    const boardColor = boardColors[boardStyle.style];
    
    // Set up socket event listeners for online games
    useEffect(() => {
        
        // Listen for opponent's move
        const handleOpponentMove = (data: {
            gameId: string,
            move: { from: string, to: string, promotion?: string },
            fen: string
        }) => {
            if (data.gameId !== gameId) return;
            
            try {
                // Make the opponent's move on our board
                chess.move({
                    from: data.move.from as Square,
                    to: data.move.to as Square,
                    promotion: data.move.promotion as 'q' | 'n' | 'r' | 'b' | undefined
                });
                
                // Highlight the move
                const highlightSquares = {
                    [data.move.from]: boardColor.lastMove,
                    [data.move.to]: boardColor.lastMove
                };
                setMoveSquares(highlightSquares);
                setMoveFrom(null);
                setMoveTo(null);
                setOptionSquares({});
                
                // Update the position
                setPosition(chess.fen());
                
                // Now it's our turn
                setIsMyTurn(true);
                
                // Check if the game is over after opponent's move
                //checkGameOver();
            } catch (error) {
                console.error("Error applying opponent's move:", error);
            }
        };
        
        SocketService.on("opponent_move", handleOpponentMove);
        
        // Clean up
        return () => {
            SocketService.off("opponent_move");
        };
    }, [gameId, chess, boardColor]);
    
    // Check if game is over
    const checkGameOver = () => {
        // Check for checkmate
        if (chess.isCheckmate()) {
            const winner = chess.turn() === 'w' ? 'black' : 'white';
            setResult(chess.turn() === playerColor ? 0 : 1, 'Checkmate!');
            
            if (gameId) {
                // Report game over to server
                SocketService.emit("game_over", {
                    gameId,
                    winner,
                    reason: "checkmate",
                    fen: chess.fen(),
                    pgn: chess.pgn(),
                    moves: chess.history()
                });
            }
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
            
            if (gameId) {
                // Report draw to server
                SocketService.emit("game_over", {
                    gameId,
                    winner: 'draw',
                    reason: reason.toLowerCase(),
                    fen: chess.fen(),
                    pgn: chess.pgn()
                });
            }
            setOptionSquares({});
            setMoveSquares({});
            setMoveFrom(null);
            setMoveTo(null);
            return true;
        }
        
        return false;
    };

    // Get valid moves for a square
    const getValidMoves = (square: Square): Square[] => {
        const moves = chess.moves({
            square,
            verbose: true
        });
        return moves.map(move => move.to as Square);
    };

    // Handle piece drop (drag and drop)
    const handleDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
        // Don't allow moves if not player's turn or color doesn't match
        if (piece[0] !== playerColor || !gameStarted || isViewingHistory) {
            return false;
        }

        if (piece[0] === "w" && piece[1] === "P" && targetSquare[1] === "8" || piece[0] === "b" && piece[1] === "P" && targetSquare[1] === "1") {
            setPromotionToSquare(targetSquare);
            setShowPromotionDialog(true);
            return false;
        }
        
        try {
            // Attempt to make the move
            const move = chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase() || "q" // Always promote to queen for simplicity
            });
            
            // If the move is valid
            if (move) {
                // Update position
                setPosition(chess.fen());
                
                // Highlight the move
                const highlightSquares = {
                    [sourceSquare]: boardColor.lastMove,
                    [targetSquare]: boardColor.lastMove
                };
                setMoveSquares(highlightSquares);
                setOptionSquares({});
                setMoveFrom(null);
                setMoveTo(null);
                setPromotionToSquare(null);
                
                // Handle online game specifics
                if (gameId) {
                    // Send move to server
                    SocketService.emit("move", {
                        gameId,
                        move: {
                            from: sourceSquare,
                            to: targetSquare,
                            promotion: move.promotion
                        },
                        fen: chess.fen()
                    });
                    
                    // Switch turns
                    setIsMyTurn(false);
                }
                
                // Check if game is over after move
                checkGameOver();
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.log("Error making move:", error);
            setMoveFrom(null);
            setMoveTo(null);
            setOptionSquares({});
            setPromotionToSquare(null);
            return false;
        }
    };

    // Handle square click (for click-based moves)
    const handleClick = (square: Square) => {
        // Don't allow moves if not player's turn in online mode
        if (!gameStarted || isViewingHistory || chess.turn()!==playerColor) return false;
        
        // Check if we already selected a piece to move
        if (!moveFrom) {
            const piece = chess.get(square);
            if (piece && piece.color === playerColor) {                                               
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
                if (piece && piece.color === playerColor) {                                       
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
                    
                    // Handle online game specifics
                    if (gameId) {
                        // Send move to server
                        SocketService.emit("move", {
                            gameId,
                            move: {
                                from: moveFrom,
                                to: square,
                                promotion: move.promotion
                            },
                            fen: chess.fen()
                        });
                        
                        // Switch turns
                        setIsMyTurn(false);
                    }
                    
                    // Check if game is over after move
                    checkGameOver();
                    
                    return true;
                }
                return false;
            }catch(error){
                console.log("Error making move:", error);
                const piece = chess.get(square);
                if (piece && piece.color === playerColor) {                                       
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
                    
                    // Handle online game specifics
                    if (gameId) {
                        // Send move to server
                        SocketService.emit("move", {
                            gameId,
                            move: {
                                from: from,
                                to: to,
                                promotion: move.promotion
                            },
                            fen: chess.fen()
                        });
                        
                        // Switch turns
                        setIsMyTurn(false);
                    }
                    
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

    return ( 
        <div 
            className={`${(isViewingHistory || !gameStarted) ? 'pointer-events-none' : ''}`} 
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
                animationDuration={200}
                arePremovesAllowed={true}
                clearPremovesOnRightClick={true}
                showBoardNotation={boardStyle.showCoordinates}
                boardOrientation={playerColor === "b" ? "black" : "white"}
                promotionDialogVariant='default'
            />
        </div>
    );
}
 
export default StandardBoard;