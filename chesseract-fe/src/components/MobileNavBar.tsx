import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiSolidChess } from "react-icons/bi";
import { HiPuzzlePiece } from "react-icons/hi2";
import { FaTrophy, FaUsers } from "react-icons/fa";
import Avatar from './utilities/Avatar';
import { useEffect, useState } from 'react';
import { getLocalStorage } from '@/utils/localstorage';

interface UserData {
    username: string;
    profilePicture?: string;
}

const MobileNavBar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const data = getLocalStorage('user');
        setUserData(data as UserData);
    }, []);

    const navItems = [
        { icon: <HiPuzzlePiece size={24} />, title: "Puzzles", href: "/home/puzzles" },
        { icon: <FaTrophy size={24} />, title: "Ranks", href: "/home/leaderboard" },
        { icon: <BiSolidChess size={24} />, title: "Play", href: "/home/play" },
        { icon: <FaUsers size={24} />, title: "Friends", href: "/home/friends" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-200 border-t border-bg-300 px-2">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center"
                        >
                            <div className={`p-1 ${isActive ? 'text-accent-200' : 'text-text-200'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-xs ${isActive ? 'text-accent-200 font-medium' : 'text-text-200'}`}>
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
                
                {/* Avatar */}
                <div 
                    className="flex flex-col items-center"
                    onClick={() => router.push('/home/profile')}
                >
                    <div className="pb-1">
                        <Avatar
                            username={userData?.username || "User"}
                            profileImage={userData?.profilePicture}
                            showUsername={false}
                            size={28}
                        />
                    </div>
                    <span className={`text-xs ${pathname.includes('/home/profile') ? 'text-accent-200 font-medium' : 'text-text-200'}`}>
                        Profile
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default MobileNavBar;