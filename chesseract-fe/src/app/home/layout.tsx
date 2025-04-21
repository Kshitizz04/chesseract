
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
        <div className="flex min-h-screen p-2">
            <SideBar isSideBarOpen={isSideBarOpen} toggleSideBar={toggleSideBar}/>

            <main className={`transition-all duration-300 w-screen overflow-y-hidden ${isSideBarOpen ? "md:ml-56" : "md:ml-16"}`}>

                <section className="w-full h-full md:pl-2">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;