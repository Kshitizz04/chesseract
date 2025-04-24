
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

            <main className={`transition-all duration-300 w-screen overflow-y-hidden ${isSideBarOpen ? "md:ml-56" : "md:ml-18"}`}>

                <section className="w-full h-screen overflow-y-auto">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;