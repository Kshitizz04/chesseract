import { use, useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface StandardBoardProps {
    isMyTurn: boolean;
    onTurnChange: () => void;
}
 
const StandardBoard = ({}:StandardBoardProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [boardWidth, setBoardWidth] = useState(500);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setBoardWidth(width);
            }
        }
        handleResize(); // Set initial size
    },[containerRef]);

    return ( 
        <div className='h-full aspect-square'>
            <div className="w-full aspect-square">
                <div className='w-full h-full' ref={containerRef}>
                    <Chessboard 
                        id="standard-board"
                        boardWidth={boardWidth}
                        position="start"
                    />
                </div>
            </div>
        </div>
    );
}
 
export default StandardBoard;