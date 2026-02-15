import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome, HiOutlineFire, HiOutlineFilm,
    HiOutlineUserGroup, HiOutlineClock, HiOutlineBookmark,
    HiOutlineThumbUp, HiOutlineVideoCamera, HiOutlineChartBar,
    HiOutlineCog, HiOutlineViewGrid, HiOutlineFolder,
    HiOutlineMusicNote, HiOutlineAcademicCap, HiOutlineDesktopComputer,
    HiOutlineSparkles, HiOutlineNewspaper, HiOutlineGlobe, HiOutlineX
} from 'react-icons/hi';
import { SiYoutubegaming } from 'react-icons/si';

const Sidebar = ({ isOpen, isMini, isMobile, onClose }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    const mainLinks = [
        { to: '/', icon: HiOutlineHome, label: 'Home' },
        { to: '/shorts', icon: HiOutlineFilm, label: 'Shorts' },
        { to: '/subscriptions', icon: HiOutlineUserGroup, label: 'Subscriptions' },
    ];

    const youLinks = [
        { to: '/history', icon: HiOutlineClock, label: 'History' },
        { to: '/playlists', icon: HiOutlineFolder, label: 'Playlists' },
        { to: '/watch-later', icon: HiOutlineBookmark, label: 'Watch later' },
        { to: '/liked-videos', icon: HiOutlineThumbUp, label: 'Liked videos' },
    ];

    const exploreLinks = [
        { to: '/trending', icon: HiOutlineFire, label: 'Trending' },
        { to: '/search?category=Music', icon: HiOutlineMusicNote, label: 'Music' },
        { to: '/search?category=Gaming', icon: SiYoutubegaming, label: 'Gaming' },
        { to: '/search?category=Education', icon: HiOutlineAcademicCap, label: 'Education' },
        { to: '/search?category=Tech', icon: HiOutlineDesktopComputer, label: 'Tech' },
        { to: '/search?category=Entertainment', icon: HiOutlineSparkles, label: 'Entertainment' },
        { to: '/search?category=News', icon: HiOutlineNewspaper, label: 'News' },
    ];

    const creatorLinks = [
        { to: '/dashboard', icon: HiOutlineChartBar, label: 'Studio' },
        { to: '/upload', icon: HiOutlineVideoCamera, label: 'Upload' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLinkClick = () => {
        if (isMobile && onClose) onClose();
    };

    const SidebarLink = ({ link }) => {
        const active = isActive(link.to);
        return (
            <NavLink
                to={link.to}
                onClick={handleLinkClick}
                className="flex items-center gap-6 px-3 py-2 rounded-xl text-sm transition-colors"
                style={{
                    backgroundColor: active ? '#272727' : 'transparent',
                    color: active ? '#f1f1f1' : '#f1f1f1',
                    fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#272727'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <link.icon className="w-5 h-5 shrink-0" style={{ color: active ? '#f1f1f1' : '#f1f1f1' }} />
                <span>{link.label}</span>
            </NavLink>
        );
    };

    // Mini sidebar (collapsed) — desktop only
    if (isMini && !isMobile) {
        return (
            <aside className="fixed left-0 top-14 bottom-0 w-[72px] z-30 hidden md:flex flex-col items-center py-1 overflow-y-auto no-scrollbar"
                style={{ backgroundColor: '#0f0f0f' }}>
                {mainLinks.map(link => {
                    const active = isActive(link.to);
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className="flex flex-col items-center justify-center gap-1 w-16 py-4 rounded-xl text-[10px] transition-colors"
                            style={{
                                backgroundColor: active ? '#272727' : 'transparent',
                                color: '#f1f1f1',
                            }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#272727'; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
                {isAuthenticated && (
                    <NavLink
                        to="/history"
                        className="flex flex-col items-center justify-center gap-1 w-16 py-4 rounded-xl text-[10px] transition-colors mt-1"
                        style={{
                            backgroundColor: isActive('/history') ? '#272727' : 'transparent',
                            color: '#f1f1f1',
                        }}
                    >
                        <HiOutlineClock className="w-5 h-5" />
                        <span>History</span>
                    </NavLink>
                )}
            </aside>
        );
    }

    // Full sidebar (desktop expanded + mobile drawer)
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 z-40 animate-fade-in"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={onClose}
                />
            )}

            <aside className={`fixed left-0 top-0 md:top-14 bottom-0 w-[280px] sm:w-[240px] z-50 md:z-40
                overflow-y-auto no-scrollbar transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${!isMobile && !isOpen ? 'md:translate-x-0' : ''}`}
                style={{ backgroundColor: '#0f0f0f', borderRight: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Mobile header with close button */}
                {isMobile && (
                    <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-2">
                            <img src="/zentube-logo.svg" alt="Zentube" className="w-8 h-8 rounded-lg" />
                            <span className="text-lg font-bold">
                                <span style={{ color: '#f1f1f1' }}>Zen</span>
                                <span style={{ color: '#ff0000' }}>tube</span>
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-[#272727]">
                            <HiOutlineX className="w-5 h-5" style={{ color: '#f1f1f1' }} />
                        </button>
                    </div>
                )}

                <div className="py-3 px-3">
                    {/* Main */}
                    <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {mainLinks.map(link => <SidebarLink key={link.to} link={link} />)}
                    </div>

                    {/* You */}
                    {isAuthenticated && (
                        <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 className="px-3 mb-2 text-base font-semibold flex items-center gap-1" style={{ color: '#f1f1f1' }}>
                                You
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 111.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 01-1.41 0c-.38-.39-.39-1.03 0-1.42z" />
                                </svg>
                            </h3>
                            {youLinks.map(link => <SidebarLink key={link.to} link={link} />)}
                        </div>
                    )}

                    {/* Explore */}
                    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 className="px-3 mb-2 text-base font-semibold" style={{ color: '#f1f1f1' }}>Explore</h3>
                        {exploreLinks.map(link => <SidebarLink key={link.label} link={link} />)}
                    </div>

                    {/* Creator */}
                    {isAuthenticated && (
                        <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 className="px-3 mb-2 text-base font-semibold" style={{ color: '#f1f1f1' }}>Creator</h3>
                            {creatorLinks.map(link => <SidebarLink key={link.to} link={link} />)}
                        </div>
                    )}

                    {/* Admin */}
                    {user?.role === 'admin' && (
                        <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <NavLink
                                to="/admin"
                                onClick={handleLinkClick}
                                className="flex items-center gap-6 px-3 py-2 rounded-xl text-sm transition-colors"
                                style={{ color: '#f1f1f1' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#272727'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <HiOutlineViewGrid className="w-5 h-5" style={{ color: '#ff0000' }} />
                                <span className="font-semibold" style={{ color: '#ff0000' }}>Admin Panel</span>
                            </NavLink>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <NavLink
                            to="/settings"
                            onClick={handleLinkClick}
                            className="flex items-center gap-6 px-3 py-2 rounded-xl text-sm transition-colors"
                            style={{
                                backgroundColor: isActive('/settings') ? '#272727' : 'transparent',
                                color: '#f1f1f1',
                                fontWeight: isActive('/settings') ? 600 : 400,
                            }}
                            onMouseEnter={(e) => { if (!isActive('/settings')) e.currentTarget.style.backgroundColor = '#272727'; }}
                            onMouseLeave={(e) => { if (!isActive('/settings')) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <HiOutlineCog className="w-5 h-5" />
                            <span>Settings</span>
                        </NavLink>
                    </div>

                    {/* Sign In Prompt */}
                    {!isAuthenticated && (
                        <div className="py-4 px-3">
                            <p className="text-sm mb-3" style={{ color: '#aaaaaa' }}>
                                Sign in to like videos, comment, and subscribe.
                            </p>
                            <NavLink to="/auth" onClick={handleLinkClick}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{ color: '#3ea6ff', border: '1px solid #3ea6ff' }}>
                                <HiOutlineGlobe className="w-4 h-4" />
                                Sign in
                            </NavLink>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="py-4 px-3 text-xs space-y-2" style={{ color: '#717171' }}>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            <span>About</span><span>Press</span><span>Copyright</span>
                            <span>Contact</span><span>Creators</span><span>Advertise</span>
                            <span>Developers</span>
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            <span>Terms</span><span>Privacy</span><span>Policy & Safety</span>
                        </div>
                        <p className="pt-2" style={{ color: 'rgba(113,113,113,0.6)' }}>© 2026 Zentube</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
