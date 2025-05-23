"use client"
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { PromotionPieceOption, Square } from "react-chessboard/dist/chessboard/types";
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
    const [playerColor, setPlayerColor] = useState<"w" | "b">(boardOrientation === "white" ? "w" : "b");
    const [position, setPosition] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [moveSquares, setMoveSquares] = useState({});
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionToSquare, setPromotionToSquare] = useState<Square | null>(null);

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
        setPlayerColor(boardOrientation === "white" ? "w" : "b");
    }, [boardOrientation]);

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
            const highlightSquares = {
                [from]: boardColor.lastMove,
                [to]: boardColor.lastMove
            };
            setMoveSquares(highlightSquares);
            setMoveFrom(null);
            setMoveTo(null);
            setOptionSquares({});
            setPromotionToSquare(null);
                
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

        if (piece[0] === "w" && piece[1] === "P" && targetSquare[1] === "8" || piece[0] === "b" && piece[1] === "P" && targetSquare[1] === "1") {
            setPromotionToSquare(targetSquare);
            setShowPromotionDialog(true);
            return false;
        }
        
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
                const highlightSquares = {
                    [sourceSquare]: boardColor.lastMove,
                    [targetSquare]: boardColor.lastMove
                };
                setMoveSquares(highlightSquares);
                setOptionSquares({});
                setMoveFrom(null);
                setMoveTo(null);
                setPromotionToSquare(null);
                setPosition(chess.fen());
                return true;
            }
        } catch (error) {
            showToast(`Invalid move: ${error}`, "error");
        }
        
        return false;
    };

    const handleClick = (square: Square) => {
        // Don't allow moves if not player's turn in online mode
        if (!isMyTurn) return false;
        if (computerThinking) return false;
        
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
                    const expectedMove = rightMoves[currentMoveIndex];
                    const playerMoveStr = moveFrom + square;
                    
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
                    
                    // Highlight the move
                    const highlightSquares = {
                        [moveFrom]: boardColor.lastMove,
                        [square]: boardColor.lastMove
                    };
                    setMoveSquares(highlightSquares);
                    setMoveFrom(null);
                    setMoveTo(null);
                    setOptionSquares({});

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
                    const expectedMove = rightMoves[currentMoveIndex];
                    const playerMoveStr = from + to
                    
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
                    
                    // Highlight the move
                    const highlightSquares = {
                        [from]: boardColor.lastMove,
                        [to]: boardColor.lastMove
                    };
                    setMoveSquares(highlightSquares);
                    setMoveFrom(null);
                    setMoveTo(null);
                    setOptionSquares({});
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
                    arePremovesAllowed={false}
                    clearPremovesOnRightClick={true}
                    boardOrientation={boardOrientation}
                    showBoardNotation={boardStyle.showCoordinates}
                    promotionDialogVariant='default'
            />
        </div>
    );
};

export default PuzzleBoard;