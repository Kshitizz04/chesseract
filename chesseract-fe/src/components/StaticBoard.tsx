import { useLayout } from "@/contexts/useLayout";
import { boardColors } from "@/models/BoardStyleData";
import { Chessboard } from "react-chessboard"

const StaticBoard = ({size}:{size:number})=>{
    const {boardStyle} = useLayout();
    const boardColor = boardColors[boardStyle.style];

    return(
        <div 
            className="pointer-events-none"
            style={{
                width: size,
                height: size,
            }}
        >
            <Chessboard
                customDarkSquareStyle={boardColor.dark}
                customLightSquareStyle={boardColor.light}
                showBoardNotation={boardStyle.showCoordinates}
            />
        </div>
    )
}

export default StaticBoard;