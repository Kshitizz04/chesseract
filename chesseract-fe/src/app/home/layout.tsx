
"use client";

import MobileNavBar from "@/components/MobileNavBar";
import SideBar from "@/components/Sidebar";
import { ReactNode, useEffect, useState } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const toggleSideBar = () => {
        setIsSideBarOpen(!isSideBarOpen);
    }

    useEffect(()=>{
        setIsSideBarOpen(true);
    },[]);

    return (
        <div className="flex min-h-screen">
            <SideBar isSideBarOpen={isSideBarOpen} toggleSideBar={toggleSideBar}/>

            <main className={`transition-all duration-300 w-screen ${isSideBarOpen ? "md:ml-56" : "md:ml-22"}`}>

                <section className="w-full h-screen md:py-2 md:pr-2 max-md:pb-16">
                    {children}
                </section>
            </main>

            <MobileNavBar/>
        </div>
    );
};

export default Layout;