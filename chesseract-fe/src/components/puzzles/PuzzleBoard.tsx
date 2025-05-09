"use client"
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";

interface PuzzleProps {
    position: string;
    puzzle: {
        FEN: string;
        Moves: string;
    } | null;
    onComplete: (isCorrect: boolean) => void;
    chess: Chess;
    gameStarted: boolean;
}

const PuzzleBoard: React.FC<PuzzleProps> = ({ position, puzzle, onComplete, chess, gameStarted }) => {
    const [boardWidth, setBoardWidth] = useState(500);
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightMoves, setRightMoves] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [computerThinking, setComputerThinking] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

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
    },[]);

    // Parse puzzle moves when a new puzzle is loaded
    useEffect(() => {
        if (puzzle) {
        chess.load(puzzle.FEN);
        // Parse the moves string (typically in the format "e2e4 e7e5 g1f3...")
        const moves = puzzle.Moves.trim().split(/\s+/);
        setRightMoves(moves);
        setCurrentMoveIndex(0);
        
        // If the computer moves first
        if (chess.turn() === 'b' && moves.length > 0) {
            makeComputerMove(moves[0]);
        }
        }
    }, [puzzle]);

    const safeGameMutate = (modify: (game: Chess) => void) => {
        const gameCopy = new Chess(chess.fen());
        modify(gameCopy);
        chess.load(gameCopy.fen());
    };

    // Make computer move
    const makeComputerMove = async (move: string) => {
        setComputerThinking(true);
        
        // Add a small delay to simulate thinking
        await new Promise(r => setTimeout(r, 500));
        
        try {
        // Format from "e2e4" to "e2-e4"
        const from = move.substring(0, 2) as Square;
        const to = move.substring(2, 4) as Square;
        const promotion = move.length > 4 ? move.substring(4, 5) : undefined;
        
        safeGameMutate(game => {
            game.move({
            from,
            to,
            promotion: promotion as any
            });
        });
        
        setCurrentMoveIndex(current => current + 1);
        } catch (error) {
        console.error("Invalid computer move:", move);
        }
        
        setComputerThinking(false);
    };

    // Handle player moves
    const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
        if (computerThinking) return false;
        
        // Get promotion piece if necessary
        const promotionPiece = piece[1].toLowerCase();
        
        try {
        const gameCopy = new Chess(chess.fen());
        
        // Check if this is a promotion move
        const isPromotion = 
            (piece === "wP" && targetSquare[1] === "8") || 
            (piece === "bP" && targetSquare[1] === "1");
        
        // Try the move
        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: isPromotion ? "q" : undefined // Default to queen promotion
        });
        
        // If the move is legal, update the game
        if (move) {
            chess.move(move);
            
            // Check if this was the expected move
            const expectedMove = rightMoves[currentMoveIndex];
            const playerMoveStr = sourceSquare + targetSquare + (isPromotion ? "q" : "");
            
            if (expectedMove.startsWith(playerMoveStr) || playerMoveStr.startsWith(expectedMove)) {
            // Correct move
            setCurrentMoveIndex(current => current + 1);
            
            // Make the next computer move if there is one
            const nextComputerMove = rightMoves[currentMoveIndex + 1];
            if (nextComputerMove) {
                setTimeout(() => {
                makeComputerMove(nextComputerMove);
                }, 300);
            } else {
                // Puzzle completed successfully
                setTimeout(() => {
                onComplete(true);
                }, 500);
            }
            } else {
            // Wrong move
            setTimeout(() => {
                onComplete(false);
            }, 500);
            }
            
            return true;
        }
        } catch (error) {
        console.error("Invalid move:", error);
        }
        
        return false;
    };

    function onSquareClick(square: Square) {
        // If it's the computer's turn or computer is thinking, don't allow moves
        if (computerThinking) return;
        
        setMoveFrom(square);
    }

    return (
        <div className={`w-full h-max md:h-full md:w-max ${(!gameStarted) && 'pointer-events-none'}`} ref={containerRef}>
            <Chessboard
                    boardWidth={boardWidth}
                    position={chess.fen()}
                    onPieceDrop={onDrop}
                    onSquareClick={onSquareClick}
                    customDarkSquareStyle={{backgroundColor:'#B7C0D8'}}
                    customLightSquareStyle={{backgroundColor:'#E8EDF9'}}
                    arePremovesAllowed={false}
            />
        </div>
    );
};

export default PuzzleBoard;