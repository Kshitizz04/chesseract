"use client";

import MobileHeader from "@/components/MobileHeader";
import MobileNavBar from "@/components/MobileNavBar";
import NotificationPanel from "@/components/modals/NotificationPanel";
import SettingsPanel from "@/components/modals/SettingsPanel";
import SideBar from "@/components/Sidebar";
import { useLayout } from "@/contexts/useLayout";
import { ReactNode } from "react";
import NavigationLoader from '@/components/NavigationLoader';

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const {
        isSideBarOpen,
        toggleSideBar,
        authData,
    } = useLayout();

    return (
        <>
            {!authData ? (
                <NavigationLoader/>
            ) : 
            (<div className="relative flex min-h-screen overflow-hidden bg-bg-100/80">

                <SideBar isSideBarOpen={isSideBarOpen} toggleSideBar={toggleSideBar}/>

                <MobileHeader />

                <main className={`transition-all duration-300 w-screen ${isSideBarOpen ? "md:pl-56" : "md:pl-22"}`}>

                    <section>
                        {children}
                    </section>
                </main>

                <NotificationPanel/>
                <SettingsPanel/>

                <MobileNavBar/>
            </div>)}
        </>
    );
};

export default Layout;