import { GiChessKnight } from "react-icons/gi";
import { FaHome, FaUsers, FaTrophy, FaChess } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { HiMenuAlt2, HiOutlineChevronLeft } from "react-icons/hi";
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
}

const NavItem = ({ icon, title, href, isSideBarOpen }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-3 py-3 rounded-md transition-all
                ${isActive ? 'bg-secondary-surface' : 'hover:bg-secondary-surface'}
                ${isSideBarOpen ? 'px-4' : 'justify-center'}
            `}
        >
            <div className="text-xl">{icon}</div>
            {isSideBarOpen && <span className="transition-all">{title}</span>}
        </Link>
    );
};

const SideBar = ({
  isSideBarOpen,
  toggleSideBar
}: SideBarProps) => {

    const navItems = [
        { icon: <FaHome size={20} />, title: 'Home', href: '/home' },
        { icon: <BiSolidChess size={20} />, title: 'Play', href: '/home/play' },
        { icon: <FaChess size={20} />, title: 'Variants', href: '/home/variants' },
        { icon: <HiPuzzlePiece size={20} />, title: 'Puzzles', href: '/home/puzzles' },
        { icon: <FaTrophy size={20} />, title: 'Leaderboard', href: '/home/leaderboard' },
        { icon: <FaUsers size={20} />, title: 'Friends', href: '/home/friends' },
    ];

    return (
        <aside
            className={`md:block hidden transition-all duration-300 bg-background fixed h-full
                    ${isSideBarOpen ? "w-56" : "w-16"}
                `}
        >
            <div className="bg-surface rounded-md w-full h-full flex flex-col p-4">
                {/* Logo and Toggle */}
                <div className="flex items-center items-center mb-8 mt-2 gap-2">
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
                    {navItems.map((item, index) => (
                        <NavItem 
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            href={item.href}
                            isSideBarOpen={isSideBarOpen}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SideBar;