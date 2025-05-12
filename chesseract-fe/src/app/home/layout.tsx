"use client";

import MobileHeader from "@/components/MobileHeader";
import MobileNavBar from "@/components/MobileNavBar";
import NotificationPanel from "@/components/modals/NotificationPanel";
import SettingsPanel from "@/components/modals/SettingsPanel";
import SideBar from "@/components/Sidebar";
import { useLayout } from "@/utils/hooks/useLayout";
import { ReactNode } from "react";
import bgImage from "@/assets/bg-img.png";

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const {
        isSideBarOpen,
        toggleSideBar,
    } = useLayout();

    return (
        <div className="relative flex min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${bgImage.src})`,
                    opacity: 0.3,
                    zIndex: -1,
                }}
            />

            <SideBar isSideBarOpen={isSideBarOpen} toggleSideBar={toggleSideBar}/>

            <MobileHeader />

            <main className={`transition-all duration-300 w-screen ${isSideBarOpen ? "md:ml-56" : "md:ml-22"}`}>

                <section className="w-full h-screen md:py-2 md:pr-2 max-md:pb-16 max-md:pt-14">
                    {children}
                </section>
            </main>

            <NotificationPanel/>
            <SettingsPanel/>

            <MobileNavBar/>
        </div>
    );
};

export default Layout;