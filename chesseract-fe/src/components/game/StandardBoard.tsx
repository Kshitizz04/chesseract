import Engine from '@/Engine';
import { Chess } from 'chess.js';
import { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, Square } from 'react-chessboard/dist/chessboard/types';

interface StandardBoardProps {
    isMyTurn: boolean;
    onTurnChange: () => void;
    setResult: (result: 0 | 1 | 2, message: string) => void;
    myColor: "w" | "b";
}

const engine = new Engine();
const chess = new Chess();
 
const StandardBoard = ({isMyTurn, onTurnChange, setResult, myColor}:StandardBoardProps) => {
    const [boardWidth, setBoardWidth] = useState(500);
    const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
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

    useEffect(()=>{
        if(!isMyTurn){
            setTimeout(() => {
                findBestMove();
            }, 2000);
        }
    })

    function findBestMove() {
        engine.evaluatePosition(chess.fen(), 2);
    
        engine.onMessage(({bestMove}) => {
        if (bestMove) {
            try{
                chess.move(bestMove);
                if(chess.isGameOver()){
                    if(chess.isThreefoldRepetition() || chess.isStalemate() || chess.isInsufficientMaterial()){
                        setResult(2, "draw")
                    }
                    if(chess.isCheckmate()){
                        chess.turn()=== myColor? setResult(0, "Opponent won by checkmate") : setResult(1, "You won by checkmate!!");
                    }
                }
                setPosition(chess.fen())
                onTurnChange()
                return true;
            }catch(e){ 
                return false;
            }
        }
        });
    }

    const handleDrop = (source:Square,target:Square,piece:Piece)=>{
        console.log("handle drop", source, target, piece)
        setOptionSquares({})
        try{
            chess.move({from:source,to: target});
            if(chess.isGameOver()){
                if(chess.isThreefoldRepetition() || chess.isStalemate() || chess.isInsufficientMaterial()){
                    setResult(2, "draw")
                }
                if(chess.isCheckmate()){
                    chess.turn()===myColor ? setResult(0, "Opponent won by checkmate") : setResult(1, "You won by checkmate!!");
                }
            }
            setPosition(chess.fen())
            onTurnChange()
            return true;
        }catch(e){ 
            return false;
        }
    }

    const handleClick = (square:Square)=>{
        console.log("handle click", square)
    }

    return ( 
        <div className='w-full h-max md:h-full md:w-max' ref={containerRef}>
            <Chessboard 
                id="standard-board"
                boardWidth={boardWidth}
                position={position}
                onPieceDrop={handleDrop}
                onSquareClick={handleClick}
                customDarkSquareStyle={{backgroundColor:'#B7C0D8'}}
                customLightSquareStyle={{backgroundColor:'#E8EDF9'}}
                customSquareStyles={{...optionSquares}}
                animationDuration={100}
                arePremovesAllowed={true}
                boardOrientation={myColor === "w" ? "white" : "black"}
            />
        </div>
    );
}
 
export default StandardBoard;