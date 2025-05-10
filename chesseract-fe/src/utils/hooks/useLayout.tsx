"use client";
import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    isNotificationPanelOpen: boolean;
    toggleNotificationPanel: () => void;
    isSettingsPanelOpen: boolean;
    toggleSettingsPanel: () => void;
    isSideBarOpen: boolean;
    toggleSideBar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);

    const toggleNotificationPanel = () => {
        setIsNotificationPanelOpen(prev => !prev);
    };

    const toggleSettingsPanel = () => {
        setIsSettingsPanelOpen(prev => !prev);
    };

    const toggleSideBar = () => {
        setIsSideBarOpen(prev => !prev);
    };

    return (
        <LayoutContext.Provider value={{
            isNotificationPanelOpen,
            toggleNotificationPanel,
            isSettingsPanelOpen,
            toggleSettingsPanel,
            isSideBarOpen,
            toggleSideBar,
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