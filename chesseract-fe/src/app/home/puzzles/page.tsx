"use client"
import Button from "@/components/utilities/CustomButton"
import { SiStackblitz } from "react-icons/si"
import { useEffect, useRef, useState } from "react"
import StaticBoard from "@/components/StaticBoard"
import { FaHandshake, FaPuzzlePiece, FaRobot } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { GiBattleGear, GiPuzzle } from "react-icons/gi"

const Puzzle = () => {
    const [size, setSize] = useState(0);

    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const container = containerRef.current;
                const width = container.clientWidth;
                const height = container.clientHeight;
                // Use the smaller dimension to create a square
                const squareSize = Math.min(width, height);
                setSize(squareSize);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return(
        <div className="h-full w-full flex justify-around max-md:flex-col rounded-md gap-2">
            <div ref={containerRef} className="h-full w-2/3 flex items-center justify-center max-md:hidden">
                <StaticBoard size={size}/>
            </div>
            <div className="h-full w-full  md:w-1/3 bg-bg-100/60 rounded-md p-4 flex flex-col items-center gap-4">
                <h2 className="text-4xl font-semibold text-center mb-4">Puzzles</h2>
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={() => router.push('puzzles/puzzle-rush')}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <GiPuzzle size={50} className="text-[#F7C631]"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Puzzle Rush</p>
                            <p className="text-md">Solve fast, beat the clock!</p>
                        </div>
                    </div>
                </div>
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={() => router.push('puzzles/puzzle-battle')}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <GiBattleGear size={50} className="text-[#81B64C]"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Puzzle Battle</p>
                            <p className="text-md">Race others to solve puzzles!</p>
                        </div>
                    </div>
                </div>
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={() => router.push('puzzles/daily-puzzle')}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <FaPuzzlePiece size={50} className="text-gradient-end"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Daily Puzzle</p>
                            <p className="text-md">One new challenge every day!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Puzzle