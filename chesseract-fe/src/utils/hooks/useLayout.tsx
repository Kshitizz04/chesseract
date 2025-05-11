"use client";
import { useToast } from '@/contexts/ToastContext';
import getNotifications, { Notification } from '@/services/getNotifications';
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
    loading: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

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
            setLoading(true);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshNotifications();
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
            loading,
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