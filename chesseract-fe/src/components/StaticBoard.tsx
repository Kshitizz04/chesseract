import { Chessboard } from "react-chessboard"

const StaticBoard = ({size}:{size:number})=>{

    return(
        <div 
            className="pointer-events-none"
            style={{
                width: size,
                height: size,
            }}
        >
            <Chessboard
                customDarkSquareStyle={{backgroundColor:'#B7C0D8'}}
                customLightSquareStyle={{backgroundColor:'#E8EDF9'}}
            />
        </div>
    )
}

export default StaticBoard;