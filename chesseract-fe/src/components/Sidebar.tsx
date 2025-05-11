import { useEffect, useState } from "react";
import { FaUsers, FaTrophy } from "react-icons/fa";
import { HiMenuAlt2, HiOutlineChevronLeft, HiChevronDown, HiChevronUp } from "react-icons/hi";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiSolidChess } from "react-icons/bi";
import { HiPuzzlePiece } from "react-icons/hi2";
import { IoMdNotifications, IoMdSettings } from "react-icons/io";
import { getLocalStorage } from "@/utils/localstorage";
import Avatar from './utilities/Avatar';
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from '@/contexts/ThemeContext';
import { useLayout } from "@/utils/hooks/useLayout";

interface SideBarProps {
    isSideBarOpen: boolean;
    toggleSideBar: () => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    title: string;
    href: string;
    isSideBarOpen: boolean;
    children?: React.ReactNode;
}

interface UserData {
    username: string;
    profilePicture?: string;
}

const NavItem = ({ icon, title, href, isSideBarOpen, children }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = Boolean(children);

    const handleMouseEnter = () => {
        if (hasChildren) setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (hasChildren) setIsOpen(false);
    };

    return (
        <div 
            className="relative" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link 
                href={href}
                className={`flex items-center gap-3 py-3 rounded-md hover:bg-bg-300 hover:text-accent-200
                    ${isActive && 'bg-bg-300 text-accent-200'}
                    ${isSideBarOpen ? 'px-4' : 'justify-center'}
                `}
            >
                <div className="text-xl">{icon}</div>
                {isSideBarOpen && (
                    <>
                        <span className="transition-all flex-1">{title}</span>
                        {hasChildren && (
                            <div className="text-sm">
                                {isOpen ? <HiChevronUp /> : <HiChevronDown />}
                            </div>
                        )}
                    </>
                )}
            </Link>
            
            {/* Dropdown menu */}
            {hasChildren && isOpen && isSideBarOpen && (
                <div className="pl-8 mt-1 space-y-1 border-l-2 border-accent-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({ title, href }: { title: string; href: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link 
            href={href}
            className={`block py-2 px-3 rounded-md text-sm transition-all hover:bg-bg-300 hover:text-accent-200
                ${isActive && 'bg-bg-300 text-accent-200'}`}
        >
            {title}
        </Link>
    );
};

const SideBar = ({
  isSideBarOpen,
  toggleSideBar
}: SideBarProps) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const { theme, toggleTheme } = useTheme();
    const {toggleNotificationPanel, toggleSettingsPanel, unreadCount} = useLayout();
    const router = useRouter();

    useEffect(() => {
        const data = getLocalStorage('user');
        setUserData(data as UserData);
    }, []);

    return (
        <aside
            className={`md:block hidden transition-all duration-300 fixed h-screen text-text-200 p-2
                    ${isSideBarOpen ? "w-56" : "w-22"}
                `}
        >
            <div className="bg-bg-200 rounded-md w-full h-full flex flex-col p-2">
                {/* Logo and Toggle */}
                <div className={`flex items-center mb-8 mt-2 gap-2 ${!isSideBarOpen && 'justify-center'}`}>
                    <button 
                        onClick={toggleSideBar}
                        className="p-1 rounded-md hover:bg-bg-200-hover"
                        aria-label={isSideBarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSideBarOpen ? (
                            <HiOutlineChevronLeft size={20} />
                        ) : (
                            <HiMenuAlt2 size={20} />
                        )}
                    </button>
                    
                    <h1 className={`text-xl font-bold ${!isSideBarOpen && 'hidden'}`}>Chesseract</h1>
                </div>
                
                {/* Navigation Items */}
                <nav className="flex flex-col gap-2">
                    {/* Play with dropdown options */}
                    <NavItem 
                        icon={<BiSolidChess size={20} />} 
                        title="Play" 
                        href="/home/play" 
                        isSideBarOpen={isSideBarOpen}
                    >
                        <DropdownItem title="Online" href="/home/play/online" />
                        <DropdownItem title="Computers" href="/home/play/bots" />
                        <DropdownItem title="Friends" href="/home/play/friends" />
                    </NavItem>
                    
                    {/* <NavItem 
                        icon={<FaChess size={20} />} 
                        title="Variants" 
                        href="/home/variants" 
                        isSideBarOpen={isSideBarOpen}
                    /> */}
                    
                    {/* Puzzles with dropdown options */}
                    <NavItem 
                        icon={<HiPuzzlePiece size={20} />} 
                        title="Puzzles" 
                        href="/home/puzzles" 
                        isSideBarOpen={isSideBarOpen}
                    >
                        <DropdownItem title="Puzzle Rush" href="/home/puzzles/puzzle-rush" />
                        <DropdownItem title="Puzzle Battle" href="/home/puzzles/puzzle-battle" />
                        <DropdownItem title="Daily Puzzle" href="/home/puzzles/daily-puzzle" />
                    </NavItem>
                    
                    <NavItem 
                        icon={<FaTrophy size={20} />} 
                        title="Leaderboard" 
                        href="/home/leaderboard" 
                        isSideBarOpen={isSideBarOpen}
                    />
                    
                    <NavItem 
                        icon={<FaUsers size={20} />} 
                        title="Friends" 
                        href="/home/friends" 
                        isSideBarOpen={isSideBarOpen}
                    />

                </nav>
                <div className="mt-auto mb-5 pt-4 border-t border-accent-200">
                    <div
                        className={`flex items-center gap-3 py-3
                            ${isSideBarOpen ? 'px-4' : 'justify-center'}
                        `}
                    >
                        {isSideBarOpen && (
                            <span className="transition-all flex-1">Theme</span>
                        )}
                        <div className="relative inline-flex items-center cursor-pointer" onClick={(e) => {e.stopPropagation(); toggleTheme()}}>
                            <input 
                                type="checkbox" 
                                value="" 
                                id="theme-toggle" 
                                className="sr-only peer"
                                checked={theme === 'dark'}
                                readOnly
                            />
                            {/* <div className="w-14 h-7 bg-bg-100 rounded-full peer peer-checked:after:translate-x-[calc(100%+3px)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-accent-200 after:rounded-full after:h-6 after:w-6 after:transition-all"></div> */}
                            <div className="relative w-14 h-7 bg-bg-300 rounded-full p-[1px] flex items-center justify-between text-accent-200">
                                <MdDarkMode className="h-6 w-6"/>
                                <MdLightMode className="h-6 w-6"/>
                                <div className={`absolute w-6 h-6 bg-accent-200 rounded-full
                                        ${theme === 'dark' ? 'translate-x-[calc(100%+5px)]' : 'translate-x-[1px]'}
                                        transition-all duration-300
                                    `}/>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`relative flex items-center gap-3 py-3 rounded-md hover:bg-bg-100 cursor-pointer
                            ${isSideBarOpen ? 'px-4' : 'justify-center'}
                        `}
                        onClick={toggleNotificationPanel}
                    >
                        <IoMdNotifications size={20}/>
                        {isSideBarOpen && (
                            <span className="transition-all flex-1">Notifications</span>
                        )}

                        {unreadCount > 0 && (
                        <span className={`${!isSideBarOpen && 'absolute'} top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>
                            {unreadCount < 10 ? unreadCount : '9+'}
                        </span>
                        )}
                    </div>
                    
                    <div
                        className={`flex items-center gap-3 py-3 rounded-md hover:bg-bg-100 cursor-pointer
                            ${isSideBarOpen ? 'px-4' : 'justify-center'}
                        `}
                        onClick={toggleSettingsPanel}
                    >
                        <IoMdSettings size={20}/>
                        {isSideBarOpen && (
                            <span className="transition-all flex-1">Settings</span>
                        )}
                    </div>

                    <div className={`mt-1 flex items-center gap-3 p-2 rounded-md bg-bg-200-hover ${!isSideBarOpen && 'justify-center'}`}>
                        <Avatar 
                            username={userData?.username || "User"}
                            profileImage={userData?.profilePicture}
                            showUsername={isSideBarOpen}
                            size={isSideBarOpen ? 40 : 30}
                            onClick={()=>router.push("/home/profile")}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SideBar;