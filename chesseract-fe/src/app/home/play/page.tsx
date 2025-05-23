"use client"
import { SiStackblitz } from "react-icons/si"
import { useEffect, useRef, useState } from "react"
import StaticBoard from "@/components/StaticBoard"
import { FaHandshake, FaRobot } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import Image from "next/image"
import playImage from "@/assets/play-game.png"
import { useToast } from "@/contexts/ToastContext"

const Play = () => {
    const [size, setSize] = useState(0);

    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const {showToast} = useToast();

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

    const handlePlayFriend = () => {
        showToast("This feature is not available yet", "info");
    }

    return(
        <div className="page flex justify-around max-md:flex-col rounded-md gap-2">
            <div ref={containerRef} className="h-full w-2/3 flex items-center justify-center max-md:hidden">
                <StaticBoard size={size}/>
            </div>
            <div className="h-full w-full  md:w-1/3 bg-bg-100/60 rounded-md p-4 flex flex-col items-center gap-4">
                <h2 className="text-4xl font-semibold text-center mb-4">Play Chess</h2>
                <Image 
                    src={playImage.src} 
                    alt="play game"
                    width={200}
                    height={200}
                />
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={() => router.push('play/online')}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <SiStackblitz size={50} className="text-yellow-500"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Play Online</p>
                            <p className="text-md">Play VS a person of similar skill</p>
                        </div>
                    </div>
                </div>
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={handlePlayFriend}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <FaHandshake size={50} className="text-[#ffdbac]"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Play a Friend</p>
                            <p className="text-md">Invite a friend to a game of chess</p>
                        </div>
                    </div>
                </div>
                <div
                    className="mb-4 w-full rounded-md bg-accent-200 pb-[3px] cursor-pointer"
                    onClick={() => router.push('play/bots')}
                >
                    <div className="flex h-full w-full justify-center py-4 rounded-md gap-2 items-center bg-bg-300">
                        <FaRobot size={50} className="text-gradient-end"/>
                        <div className="flex flex-col items-start">
                            <p className="text-2xl">Play Bots</p>
                            <p className="text-md">Challenge a bot from Easy to Hard</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Play