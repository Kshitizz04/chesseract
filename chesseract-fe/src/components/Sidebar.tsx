interface SideBarProps {
    isSideBarOpen: boolean;
}

const SideBar = ({
  isSideBarOpen
}: SideBarProps) => {

    return (
        <aside
            className={`md:block hidden transition-all duration-300 bg-primary-bg-color text-text-color 
                    fixed h-[100vh] z-30 ${isSideBarOpen ? "w-56" : "w-16"} sidebar
                    border-r border-gray-800/20`}
        >
            {/* Header */}
            <div className="px-4 flex items-center gap-1 py-3 mb-2">
                Sidebar here
            </div>
        </aside>
    );
};

export default SideBar;