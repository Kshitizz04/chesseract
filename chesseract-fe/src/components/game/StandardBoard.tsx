import { ChessEngine } from '@/Engine';
import { Chess } from 'chess.js';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, Square } from 'react-chessboard/dist/chessboard/types';
import SocketService from '@/SocketService';

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
}: StandardBoardProps) => {
    const [boardWidth, setBoardWidth] = useState(500);
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [moveSquares, setMoveSquares] = useState({});
    
    const containerRef = useRef<HTMLDivElement>(null);
    
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
                const move = chess.move({
                    from: data.move.from as Square,
                    to: data.move.to as Square,
                    promotion: data.move.promotion as 'q' | 'n' | 'r' | 'b' | undefined
                });
                
                // Highlight the move
                const highlightSquares = {
                    [data.move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                    [data.move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
                };
                setMoveSquares(highlightSquares);
                
                // Update the position
                setPosition(chess.fen());
                
                // Now it's our turn
                setIsMyTurn(true);
                
                // Check if the game is over after opponent's move
                checkGameOver();
            } catch (error) {
                console.error("Error applying opponent's move:", error);
            }
        };
        
        SocketService.on("opponent_move", handleOpponentMove);
        
        // Clean up
        return () => {
            SocketService.off("opponent_move");
        };
    }, [,gameId, chess]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                const size = Math.max(width, height);
                setBoardWidth(Math.floor(size));
            }
        }
        handleResize(); // Set initial size
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    // Check if game is over
    const checkGameOver = () => {
        // Check for checkmate
        if (chess.isCheckmate()) {
            const winner = chess.turn() === 'w' ? 'black' : 'white';
            setResult(chess.turn() === playerColor ? 1 : 2, 'Checkmate!');
            
            if (gameId) {
                // Report game over to server
                SocketService.emit("game_over", {
                    gameId,
                    winner,
                    reason: "checkmate",
                    fen: chess.fen(),
                    pgn: chess.pgn()
                });
            }
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
        
        try {
            // Get current turn
            const turn = chess.turn();
            
            // Attempt to make the move
            const move = chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // Always promote to queen for simplicity
            });
            
            // If the move is valid
            if (move) {
                // Update position
                setPosition(chess.fen());
                
                // Highlight the move
                const highlightSquares = {
                    [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                    [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
                };
                setMoveSquares(highlightSquares);
                
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
            console.error("Error making move:", error);
            return false;
        }
    };

    // Handle square click (for click-based moves)
    const handleClick = (square: Square) => {
        // Clear previous highlights
        setOptionSquares({});
        
        // Don't allow moves if not player's turn in online mode
        if (!gameStarted) return;
        
        // Check if we already selected a piece to move
        if (moveFrom === null) {
            const piece = chess.get(square);
            
            // If there's a piece and it's the player's turn
            if (piece) {
                    // Only allow selecting pieces of the player's color
                    if (piece.color !== playerColor) return;
                
                setMoveFrom(square);
                
                // Highlight valid moves
                const validMoves = getValidMoves(square);
                const newOptionSquares: Record<string, React.CSSProperties> = {};
                
                // Highlight the selected square
                newOptionSquares[square] = {
                    backgroundColor: 'rgba(255, 255, 0, 0.4)',
                    borderRadius: '50%',
                };
                
                // Highlight valid move squares
                validMoves.forEach(move => {
                    newOptionSquares[move] = {
                        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                        borderRadius: '50%',
                    };
                    
                    // If there's an opponent piece, show capture highlight
                    const pieceOnTarget = chess.get(move);
                    if (pieceOnTarget) {
                        newOptionSquares[move] = {
                            background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 0 0 2px rgba(255, 0, 0, 0.7)',
                        };
                    }
                });
                
                setOptionSquares(newOptionSquares);
            }
        } else {
            // Attempt to make a move
            const move = chess.move({
                from: moveFrom,
                to: square,
                promotion: 'q' // Always promote to queen for simplicity
            });
            
            if (move) {
                // Update position
                setPosition(chess.fen());
                
                // Highlight the move
                const highlightSquares = {
                    [moveFrom]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                    [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
                };
                setMoveSquares(highlightSquares);
                
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
                
                // Check if game is over
                checkGameOver();
            }
            
            // Reset move state
            setMoveFrom(null);
            setOptionSquares({});
        }
    };

    return ( 
        <div 
            className={`w-full h-max md:h-full md:w-max ${(isViewingHistory || !gameStarted) ? 'pointer-events-none' : ''}`} 
            ref={containerRef}
        >
            <Chessboard 
                id="standard-board"
                boardWidth={boardWidth}
                position={isViewingHistory ? historyFen : position}
                onPieceDrop={handleDrop}
                onSquareClick={handleClick}
                customDarkSquareStyle={{backgroundColor:'#B7C0D8'}}
                customLightSquareStyle={{backgroundColor:'#E8EDF9'}}
                customSquareStyles={{...optionSquares, ...moveSquares}}
                animationDuration={200}
                arePremovesAllowed={true}
                showBoardNotation={true}
                boardOrientation={playerColor === "b" ? "black" : "white"}
            />
        </div>
    );
}
 
export default StandardBoard;