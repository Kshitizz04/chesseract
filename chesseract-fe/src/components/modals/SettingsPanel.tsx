import RightModalLayer from '@/components/modals/RightModalLayer';
import { useLayout } from '@/contexts/useLayout';
import { useEffect, useState } from 'react';
import { FiLogOut, FiTrash2, FiEye, FiEyeOff, FiMoon, FiSun, FiLock } from 'react-icons/fi';
import Button from '@/components/utilities/CustomButton';
import { useToast } from '@/contexts/ToastContext';
import { FaChessBoard } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import deleteAccount from '@/services/deleteAccount';
import { useRouter } from 'next/navigation';
import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { BoardStyleData } from '@/models/BoardStyleData';
import { IoMoveSharp } from 'react-icons/io5';
import { TbAxisX } from 'react-icons/tb';
import updateOnlineVisibility from '@/services/updateOnlineVisibility';
import ConfirmationModal from './ConfirmationModal';

const SettingsPanel = () => {
    const { isSettingsPanelOpen, toggleSettingsPanel } = useLayout();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const boardStyleData: BoardStyleData = getLocalStorage('boardStyle') || {style: "classic", showCoordinates: true, showLegalMoves: true};
    if(!boardStyleData) {
        setLocalStorage('boardStyle', {style: "classic", showCoordinates: true, showLegalMoves: true});
    }

    
    // States for settings
    const [isOnlineVisible, setIsOnlineVisible] = useState(true);
    const [showCoordinates, setShowCoordinates] = useState(boardStyleData.showCoordinates);
    const [showLegalMoves, setShowLegalMoves] = useState(boardStyleData.showLegalMoves);
    const [boardStyle, setBoardStyle] = useState<'classic' | 'wooden' | 'marble'>(boardStyleData.style);
    
    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    useEffect(() => {
        const newData = {
            style: boardStyle,
            showCoordinates: showCoordinates,
            showLegalMoves: showLegalMoves
        };
        setLocalStorage('boardStyle', newData);
    }, [showCoordinates, showLegalMoves, boardStyle]);
    
    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // Password change logic would go here
        showToast('Password updated successfully', 'success');
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    const handleLogout = () => {
        router.push('/auth/sign-in');
        localStorage.clear();
    };
    
    const handleDeleteAccount = async (password: string) => {
        console.log("trying in panel")
        try {
            const res = await deleteAccount({ password });
            router.push("/auth/sign-up");
            if(res.success){
                showToast('Account deleted successfully', 'success');
            }
            else{
                const error = res.error || "An error occurred";
                showToast(error, "error");
            }
        }catch (err) {
            console.error("Account deletion failed:", err);
        }
    };

    const handleToggleVisibility = async () => {
        try{
            setIsOnlineVisible(!isOnlineVisible);
            const res = await updateOnlineVisibility({showOnlineStatus: !isOnlineVisible});
            if(!res.success){
                const error = res.error || "An error occurred";
                showToast(error, "error");
                setIsOnlineVisible(isOnlineVisible);
            }
        }catch (err) {
            console.error("Visibility update failed:", err);
            showToast("Failed to update visibility", "error");
        }
    }
    
    return (
        <>
            <RightModalLayer
                isOpen={isSettingsPanelOpen}
                onClose={toggleSettingsPanel}
                title="Settings"
            >
                <div className="space-y-6 p-2">
                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-bg-300 pb-2">Appearance</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-text-200 mb-2">Theme</p>
                                <div className="flex gap-2">
                                    <Button
                                        disabled={theme === 'light'}
                                        onClick={() => toggleTheme()}
                                        bg={`${theme === 'light' ? 'bg-bg-100' : 'bg-bg-300'}`}
                                        className={`border-accent-200 ${theme === 'light' ? 'border' : ''}`}
                                    >
                                        <FiSun />
                                        <span>Light</span>
                                    </Button>
                                    <Button
                                        disabled={theme === 'dark'}
                                        onClick={() => toggleTheme()}
                                        bg={`${theme === 'dark' ? 'bg-bg-100' : 'bg-bg-300'}`}
                                        className={`border-accent-200 ${theme === 'dark' ? 'border' : ''}`}
                                    >
                                        <FiMoon />
                                        <span>Dark</span>
                                    </Button>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-text-200 mb-2">Board Style</p>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setBoardStyle('classic')}
                                            bg={`${boardStyle === 'classic' ? 'bg-bg-100' : 'bg-bg-300'}`}
                                            className={`border-accent-200 ${boardStyle === 'classic' ? 'border' : ''} gap-2`}
                                        >
                                            <FaChessBoard />
                                            <span>Classic</span>
                                        </Button>
                                        <Button
                                            onClick={() => setBoardStyle('wooden')}
                                            bg={`${boardStyle === 'wooden' ? 'bg-bg-100' : 'bg-bg-300'}`}
                                            className={`border-accent-200 ${boardStyle === 'wooden' ? 'border' : ''} gap-2`}
                                        >
                                            <FaChessBoard />
                                            <span>Wooden</span>
                                        </Button>
                                        <Button
                                            onClick={() => setBoardStyle('marble')}
                                            bg={`${boardStyle === 'marble' ? 'bg-bg-100' : 'bg-bg-300'}`}
                                            className={`border-accent-200 ${boardStyle === 'marble' ? 'border' : ''} gap-2`}
                                        >
                                            <FaChessBoard />
                                            <span>Marble</span>
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IoMoveSharp className="text-accent-200" />
                                            <span>Show Legal Moves</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={showLegalMoves} 
                                                onChange={() => setShowLegalMoves(!showLegalMoves)} 
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-bg-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-100"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TbAxisX className="text-accent-200"/>
                                            <span>Show Coordinates</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={showCoordinates} 
                                                onChange={() => setShowCoordinates(!showCoordinates)} 
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-bg-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-100"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Privacy Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-bg-300 pb-2">Privacy</h3>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isOnlineVisible ? (
                                    <FiEye className="text-accent-200" />
                                ) : (
                                    <FiEyeOff className="text-accent-200" />
                                )}
                                <span>Online Visibility</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isOnlineVisible} 
                                    onChange={handleToggleVisibility} 
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-bg-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-100"></div>
                            </label>
                        </div>
                    </div>
                    
                    {/* Account Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-bg-300 pb-2">Account</h3>
                        
                        {/* {!showPasswordChange ? (
                            <button 
                                onClick={() => setShowPasswordChange(true)}
                                className="flex items-center gap-2 w-full py-2 px-3 bg-bg-200 hover:bg-bg-300 rounded-md transition-colors"
                            >
                                <FiLock />
                                <span>Change Password</span>
                            </button>
                        ) : (
                            <div className="space-y-3 p-3 bg-bg-200 rounded-md">
                                <h4 className="font-medium flex items-center gap-2">
                                    <FiLock />
                                    <span>Change Password</span>
                                </h4>
                                
                                <div className="space-y-2">
                                    <input 
                                        type="password" 
                                        placeholder="Current Password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-2 bg-bg-100 rounded border border-bg-300 focus:border-accent-100 outline-none"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="New Password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-2 bg-bg-100 rounded border border-bg-300 focus:border-accent-100 outline-none"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Confirm New Password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-2 bg-bg-100 rounded border border-bg-300 focus:border-accent-100 outline-none"
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleChangePassword}
                                        className="flex-1 py-2 bg-accent-100 text-white rounded-md hover:bg-accent-200 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowPasswordChange(false);
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                        className="flex-1 py-2 bg-bg-300 rounded-md hover:bg-bg-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )} */}
                        
                        <Button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex items-center justify-center gap-2 w-full mt-2 bg-bg-300 hover:bg-bg-400"
                        >
                            <FiLogOut />
                            <span>Logout</span>
                        </Button>
                        
                        <Button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center justify-center gap-2 w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                            <FiTrash2 />
                            <span>Delete Account</span>
                        </Button>
                    </div>
                </div>
            </RightModalLayer>

            {/* Confirmation Modals */}
            {isLogoutModalOpen && <ConfirmationModal
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Logout"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
                cancelText="Cancel"
            />}

            {isDeleteModalOpen && <ConfirmationModal
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Account"
                message="This action cannot be undone. All your data will be permanently deleted."
                confirmText="Delete Account"
                cancelText="Cancel"
                isDangerous={true}
                passwordRequired={true}
                onPasswordRequired={handleDeleteAccount}
            />}
        </>
    );
};

export default SettingsPanel;