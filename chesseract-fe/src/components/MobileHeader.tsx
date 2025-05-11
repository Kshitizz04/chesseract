import { IoMdSettings, IoMdNotifications } from 'react-icons/io';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useTheme } from '@/contexts/ThemeContext';
import { useLayout } from '@/utils/hooks/useLayout';
import Image from 'next/image';
import logo from "@/assets/logo.png";
import LogoTextSvg from '@/assets/LogoTextSvg';

const MobileHeader = () => {
	const { theme, toggleTheme } = useTheme();
	const {toggleNotificationPanel, toggleSettingsPanel, unreadCount} = useLayout();

    return (
		<header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-bg-200 border-b border-bg-300 px-4 flex items-center justify-between z-20">
			<div className="flex items-center">
					<LogoTextSvg id="mobile-header" className='w-40'/>
			</div>

			<div className="flex items-center space-x-4">
				{/* Theme Toggle */}
				<button 
					className="p-2 text-text-200 rounded-full hover:bg-bg-300"
					onClick={toggleTheme}
					aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
				>
					{theme === 'dark' ? (
						<MdLightMode className="h-5 w-5" />
					) : (
						<MdDarkMode className="h-5 w-5" />
					)}
				</button>

				{/* Notifications */}
				<button 
					className="p-2 text-text-200 rounded-full hover:bg-bg-300 relative"
					onClick={toggleNotificationPanel} 
					aria-label="Notifications"
				>
					<IoMdNotifications className="h-5 w-5" />
					{unreadCount > 0 && (
					<span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
						{unreadCount < 6 ? unreadCount : '5+'}
					</span>
					)}
				</button>

				{/* Settings */}
				<button 
					className="p-2 text-text-200 rounded-full hover:bg-bg-300"
					onClick={toggleSettingsPanel}
					aria-label="Settings"
				>
					<IoMdSettings className="h-5 w-5" />
				</button>
			</div>
		</header>
    );
};

export default MobileHeader;