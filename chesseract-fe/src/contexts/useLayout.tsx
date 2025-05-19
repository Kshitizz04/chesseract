"use client";
import { useToast } from '@/contexts/ToastContext';
import { AuthData } from '@/models/AuthData';
import refreshToken from '@/services/auth/refreshToken';
import getNotifications, { Notification } from '@/services/getNotifications';
import { setLocalStorage } from '@/utils/localstorage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface LayoutContextType {
    isNotificationPanelOpen: boolean;
    toggleNotificationPanel: () => void;
    isSettingsPanelOpen: boolean;
    toggleSettingsPanel: () => void;
    isSideBarOpen: boolean;
    toggleSideBar: () => void;
    notifications: Notification[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    authData: AuthData | null;
    setAuthData: React.Dispatch<React.SetStateAction<AuthData | null>>;
    loadingAuth: boolean;
    loadingNotifications: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [authData, setAuthData] = useState<AuthData | null>(null);

    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();

    const toggleNotificationPanel = () => {
        setIsNotificationPanelOpen(prev => !prev);
    };

    const toggleSettingsPanel = () => {
        setIsSettingsPanelOpen(prev => !prev);
    };

    const toggleSideBar = () => {
        setIsSideBarOpen(prev => !prev);
    };

    const refreshNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const response = await getNotifications();
            
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            } else {
                const error = response.message || "An error occurred";
                showToast(error, "error");
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const getRefreshToken = async () => {
        try {
            setLoadingAuth(true);
            const res = await refreshToken();
            if (res.success) {
                setAuthData(res.data.user);
                setLocalStorage("user", res.data.user);
                if(res.data.token) {
                    setLocalStorage("token", res.data.token);
                }
            } else{
                const error = res.message || "An error occurred";
                showToast(error, "error");
                router.push("/auth/sign-in");
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            showToast("Session expired. Please log in again.", "error");
            router.push("/auth/sign-in");
        }finally{
            setLoadingAuth(false);
        }
    }

    useEffect(() => {
        refreshNotifications();
        getRefreshToken();
    }, []);

    return (
        <LayoutContext.Provider value={{
            isNotificationPanelOpen,
            toggleNotificationPanel,
            isSettingsPanelOpen,
            toggleSettingsPanel,
            isSideBarOpen,
            toggleSideBar,
            notifications,
            unreadCount,
            refreshNotifications,
            authData,
            setAuthData,
            loadingAuth,
            loadingNotifications,
        }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
  return context;
};