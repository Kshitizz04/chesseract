import { useState } from "react";
import { FaHome, FaUsers, FaTrophy, FaChess } from "react-icons/fa";
import { HiMenuAlt2, HiOutlineChevronLeft, HiChevronDown, HiChevronUp } from "react-icons/hi";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiSolidChess } from "react-icons/bi";
import { HiPuzzlePiece } from "react-icons/hi2";

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
                href={hasChildren ? "#" : href} 
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                className={`flex items-center gap-3 py-3 rounded-md transition-all
                    ${isActive ? 'bg-background' : 'hover:bg-secondary-surface'}
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
                <div className="pl-8 mt-1 space-y-1 border-l-2 border-secondary-surface">
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
            className={`block py-2 px-3 rounded-md text-sm transition-all
                ${isActive ? 'bg-background' : 'hover:bg-secondary-surface'}`}
        >
            {title}
        </Link>
    );
};

const SideBar = ({
  isSideBarOpen,
  toggleSideBar
}: SideBarProps) => {

    return (
        <aside
            className={`md:block hidden transition-all duration-300 bg-background fixed h-full
                    ${isSideBarOpen ? "w-56" : "w-16"}
                `}
        >
            <div className="bg-surface rounded-md w-full h-full flex flex-col p-4">
                {/* Logo and Toggle */}
                <div className="flex items-center mb-8 mt-2 gap-2">
                    <button 
                        onClick={toggleSideBar}
                        className="p-1 rounded-md hover:bg-surface-hover"
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
                    
                    <NavItem 
                        icon={<FaChess size={20} />} 
                        title="Variants" 
                        href="/home/variants" 
                        isSideBarOpen={isSideBarOpen}
                    />
                    
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
            </div>
        </aside>
    );
};

export default SideBar;