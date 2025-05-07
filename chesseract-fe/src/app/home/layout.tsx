
"use client";

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

            <main className={`transition-all duration-300 w-screen ${isSideBarOpen ? "md:ml-56" : "md:ml-18"}`}>

                <section className="w-full h-screen md:py-2 md:pr-2">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;