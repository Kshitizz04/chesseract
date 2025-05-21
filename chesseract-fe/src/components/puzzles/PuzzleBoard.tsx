"use client"
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { useToast } from "@/contexts/ToastContext";
import { useLayout } from "@/contexts/useLayout";
import { boardColors } from "@/models/BoardStyleData";

interface PuzzleProps {
    chess: Chess;
    puzzle: {
        FEN: string;
        Moves: string;
    } | null;
    onComplete: (isCorrect: boolean) => void;
    gameStarted: boolean;
    size: number;
}

const PuzzleBoard: React.FC<PuzzleProps> = ({ chess, puzzle, onComplete, gameStarted, size }) => {
    const [rightMoves, setRightMoves] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [computerThinking, setComputerThinking] = useState(false);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
    const [position, setPosition] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    const {showToast} = useToast();
    const {boardStyle} = useLayout();
    const boardColor = boardColors[boardStyle.style];

    // Parse puzzle moves when a new puzzle is loaded
    useEffect(() => {
        if (puzzle) {
            chess.load(puzzle.FEN);
            const moves = puzzle.Moves.trim().split(/\s+/);
            setRightMoves(moves);
            setPosition(puzzle.FEN);
            setCurrentMoveIndex(0);
            if(chess.turn() === 'w') {
                setBoardOrientation('black');
            }else{
                setBoardOrientation('white');
            }

        }
    }, [puzzle]);

    useEffect(() => {
        makeComputerMove(rightMoves[currentMoveIndex]);
    }, [rightMoves]);

    const makeComputerMove = async (move: string) => {
        setComputerThinking(true);
        
        // Add a small delay to simulate thinking
        await new Promise(r => setTimeout(r, 500));
        
        try {
            const from = move.substring(0, 2) as Square;
            const to = move.substring(2, 4) as Square;
            const promotion = "q";

            chess.move({
                from: from,
                to: to,
                promotion: promotion as any
            })
            setPosition(chess.fen());
            setCurrentMoveIndex(current => current + 1);
            setIsMyTurn(true);
            setComputerThinking(false);
        } catch (error) {
            console.log("Invalid computer move:", error);
        }
    };

    const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
        if(!isMyTurn) return false;
        if (computerThinking) return false;
        
        try {
            const move = chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase() ?? "q"
            });

            if (move) {

                const expectedMove = rightMoves[currentMoveIndex];
                const playerMoveStr = sourceSquare + targetSquare
                
                if (expectedMove.startsWith(playerMoveStr) || playerMoveStr.startsWith(expectedMove)) {
                    setCurrentMoveIndex(current => current + 1);
                    const nextComputerMove = rightMoves[currentMoveIndex + 1];
                    if (nextComputerMove) {
                        makeComputerMove(nextComputerMove);
                    } else {
                        onComplete(true);
                    }
                } else {
                    onComplete(false);
                }
                setPosition(chess.fen());
                return true;
            }
        } catch (error) {
            showToast(`Invalid move: ${error}`, "error");
        }
        
        return false;
    };

    return (
        <div 
            className={`${(!gameStarted) && 'pointer-events-none'}`} 
            style={{
                width: size-44,
                height: size-44,
            }}
        >
            <Chessboard
                    position={position}
                    onPieceDrop={onDrop}
                    customDarkSquareStyle={boardColor.dark}
                    customLightSquareStyle={boardColor.light}
                    customSquareStyles={boardStyle.showLegalMoves ? {} : {}}
                    arePremovesAllowed={false}
                    boardOrientation={boardOrientation}
                    showBoardNotation={boardStyle.showCoordinates}
            />
        </div>
    );
};

export default PuzzleBoard;