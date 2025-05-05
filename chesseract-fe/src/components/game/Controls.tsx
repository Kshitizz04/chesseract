import { useState, useEffect, useRef, use } from 'react';
import { Chess } from 'chess.js';
import Button from '@/components/utilities/CustomButton';
import { BsFillFlagFill } from 'react-icons/bs';
import { MdArrowForwardIos, MdOutlineArrowBackIos } from 'react-icons/md';
import { FaSoundcloud } from 'react-icons/fa';

interface ControlsProps {
    chess: Chess;
    handleViewHistory: (isViewing: boolean, historyFen: string) => void;
    currentPosition: string;
    onResign: () => void;
}

const Controls = ({
    chess,
    handleViewHistory,
    currentPosition,
    onResign,
}: ControlsProps) => {
    const [history, setHistory] = useState<string[]>([]);
    const positionHistoryRef = useRef<Record<number, string>>({});
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    useEffect(()=>{
        if(chess.history().length === 0) return;
        const history = chess.history();
        setHistory(history);
        positionHistoryRef.current[history.length-1] = chess.fen();
    },[currentPosition])

    useEffect(()=>{
        setCurrentMoveIndex(history.length - 1);
    },[history])

    const handleUndo = () => {
        console.log("Resign clicked");
    }

    const handleViewLastMove = () => {
        if(currentMoveIndex <= 0) return;
        handleViewHistory(true, positionHistoryRef.current[currentMoveIndex-1]);
        setCurrentMoveIndex((prev)=>prev-1)
    }

    const handleViewNextMove = () => {
        if(currentMoveIndex >= history.length - 1) return;
        handleViewHistory(true, positionHistoryRef.current[currentMoveIndex+1]);
        setCurrentMoveIndex((prev)=>prev+1)
    }

    const handleViewHistoryClick = (index:number) => {
        if(index === history.length - 1){
            setCurrentMoveIndex(index);
            handleViewHistory(false, chess.fen());
        }else{
            setCurrentMoveIndex(index);
            const historyFen = positionHistoryRef.current[index];
            if(historyFen){
                handleViewHistory(true, historyFen);
            }
        }
    }

    return (
        <div className='flex flex-col h-full'>
            {/* <div className='grid grid-cols-6'>
                {history.map((move, index)=>{
                    return(
                        <span 
                            className={`rounded-sm hover:border border-accent-100 cursor-pointer p-1 text-sm ${index === currentMoveIndex-1 ? 'bg-bg-100 text-accent-200' : ''}`}
                            key={index}
                            onClick={handleViewHistoryClick}
                        >
                            {move}
                        </span>
                    )
                })}
            </div> */}

            <div className='grid grid-cols-6'>
                {history.reduce<React.ReactNode[]>((acc, move, index) => {
                    // Determine if this is a white move (even index) or black move (odd index)
                    const isWhiteMove = index % 2 === 0;
                    
                    if (isWhiteMove) {
                        // For white moves, create a move number + the move
                        acc.push(
                            <span 
                                key={`move-number-${index}`}
                                className="text-sm text-text-100 p-1 text-center"
                            >
                                {Math.floor(index / 2) + 1}.
                            </span>
                        );
                    }
                    
                    // Add the actual move
                    acc.push(
                        <span 
                            className={`rounded-sm hover:border border-accent-100 cursor-pointer p-1 text-sm ${index === currentMoveIndex ? 'bg-bg-100 text-accent-200' : ''}`}
                            key={index}
                            onClick={() => handleViewHistoryClick(index)}
                        >
                            {move}
                        </span>
                    );
                    
                    return acc;
                }, [])}
            </div>

            {/* History Index buttons */}
            <div className='flex gap-2 pt-2 justify-center mb-2'>
                <Button
                    onClick={handleViewLastMove}
                    className='flex gap-2 w-max items-center bg-bg-100 justify-center'
                >
                    <MdOutlineArrowBackIos />
                </Button>
                <Button
                    onClick={handleViewNextMove}
                    className='flex gap-2 w-max items-center bg-bg-100 justify-center'
                >
                    <MdArrowForwardIos />
                </Button>
            </div>

            {/* Resign Undo Buttons */}
            <div className='flex gap-2 border-t-1 border-accent-100 pt-2 mb-2 mt-auto'>
                <Button
                    onClick={onResign}
                    className='flex gap-2 items-center bg-bg-100 justify-center'
                >
                    <BsFillFlagFill/>
                    <p>Resign</p>
                </Button>
                <Button
                    onClick={handleUndo}
                    className='flex gap-2 items-center bg-bg-100 justify-center'
                >
                    <FaSoundcloud />
                    <p>Undo</p>
                </Button>
            </div>
        </div>
    );
};

export default Controls;