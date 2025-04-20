
"use client";

import SideBar from "@/components/Sidebar";
import { ReactNode, useState } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <SideBar isSideBarOpen={isSideBarOpen}/>

            <main className="transition-all duration-300 w-screen overflow-y-hidden">

                <section className="w-full h-full">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;