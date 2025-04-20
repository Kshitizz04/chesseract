interface SideBarProps {
    isSideBarOpen: boolean;
}

const SideBar = ({
  isSideBarOpen
}: SideBarProps) => {

    return (
        <aside
            className={`md:block hidden transition-all duration-300 bg-background fixed h-full
                    ${isSideBarOpen ? "w-56" : "w-16"}
                `}
        >
            {/* Header */}
            <div className="bg-surface rounded-md w-full h-full">
                Sidebar here
            </div>
        </aside>
    );
};

export default SideBar;