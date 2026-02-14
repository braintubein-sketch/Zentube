import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    // Pages where sidebar should be mini (collapsed)
    const miniSidebarPages = ['/watch', '/shorts'];
    const noSidebarPages = ['/auth'];
    const isMini = miniSidebarPages.some(p => location.pathname.startsWith(p));
    const noSidebar = noSidebarPages.some(p => location.pathname.startsWith(p));

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const getMainClass = () => {
        if (noSidebar) return 'mt-14';
        if (isMini) return 'mt-14 md:ml-[72px]';
        if (sidebarOpen) return 'mt-14 md:ml-[240px]';
        return 'mt-14 md:ml-[72px]';
    };

    return (
        <div className="min-h-screen bg-z-bg">
            <Navbar onToggleSidebar={toggleSidebar} />

            {!noSidebar && (
                <Sidebar isOpen={sidebarOpen} isMini={isMini || !sidebarOpen} />
            )}

            <main className={`${getMainClass()} transition-all duration-300 ease-out`}>
                <div className={`${isMini || noSidebar ? '' : 'p-6'} ${isMini ? 'p-0' : ''}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
