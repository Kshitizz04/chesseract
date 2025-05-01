import { ChessEngine } from '@/Engine';
import { Chess } from 'chess.js';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, Square } from 'react-chessboard/dist/chessboard/types';

interface StandardBoardProps {
    position: string;
    setPosition:Dispatch<SetStateAction<string>>
    chess: Chess;
    setResult: (result: 0 | 1 | 2, message: string) => void;
    gameStarted: boolean;
    isViewingHistory?: boolean;
    historyFen?: string;
}
 
const StandardBoard = ({position, setPosition, chess, setResult, gameStarted, isViewingHistory, historyFen}:StandardBoardProps) => {
    const [boardWidth, setBoardWidth] = useState(500);
    const [optionSquares,setOptionSquares]=useState({})

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

    const handleDrop = (source:Square,target:Square,piece:Piece)=>{
        return false
    }

    const handleClick = (square:Square)=>{
    }

    return ( 
        <div className={`w-full h-max md:h-full md:w-max ${(!gameStarted || isViewingHistory) && 'pointer-events-none'}`} ref={containerRef}>
            <Chessboard 
                id="standard-board"
                boardWidth={boardWidth}
                position={isViewingHistory ? historyFen : position}
                onPieceDrop={handleDrop}
                onSquareClick={handleClick}
                customDarkSquareStyle={{backgroundColor:'#B7C0D8'}}
                customLightSquareStyle={{backgroundColor:'#E8EDF9'}}
                customSquareStyles={{...optionSquares}}
                animationDuration={100}
                arePremovesAllowed={true}
                showBoardNotation={true}
            />
        </div>
    );
}
 
export default StandardBoard;