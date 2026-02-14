import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome, HiOutlineFire, HiOutlineFilm,
    HiOutlineUserGroup, HiOutlineClock, HiOutlineBookmark,
    HiOutlineThumbUp, HiOutlineVideoCamera, HiOutlineChartBar,
    HiOutlineCog, HiOutlineViewGrid, HiOutlineFolder,
    HiOutlineMusicNote, HiOutlineAcademicCap, HiOutlineDesktopComputer,
    HiOutlineSparkles, HiOutlineNewspaper, HiOutlineGlobe
} from 'react-icons/hi';
import { SiYoutubegaming } from 'react-icons/si';

const Sidebar = ({ isOpen, isMini }) => {
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

    // Mini sidebar (collapsed)
    if (isMini) {
        return (
            <aside className="fixed left-0 top-14 bottom-0 w-[72px] bg-z-bg z-30
        hidden md:flex flex-col items-center py-1 overflow-y-auto no-scrollbar">
                {mainLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={`sidebar-item-mini ${isActive(link.to) ? 'sidebar-item-mini-active' : ''}`}
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
                {isAuthenticated && (
                    <>
                        <NavLink
                            to="/history"
                            className={`sidebar-item-mini mt-1 ${isActive('/history') ? 'sidebar-item-mini-active' : ''}`}
                        >
                            <HiOutlineClock className="w-5 h-5" />
                            <span>History</span>
                        </NavLink>
                    </>
                )}
            </aside>
        );
    }

    // Full sidebar
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
                    onClick={() => { }}
                />
            )}

            <aside className={`fixed left-0 top-14 bottom-0 w-[240px] bg-z-bg z-40
        overflow-y-auto no-scrollbar transition-transform duration-300 ease-out
        border-r border-z-border/30
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                <div className="py-3 px-3">
                    {/* Main */}
                    <div className="pb-3 border-b border-z-border/50">
                        {mainLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={`sidebar-item ${isActive(link.to) ? 'sidebar-item-active' : ''}`}
                            >
                                <link.icon className={`w-5 h-5 ${isActive(link.to) ? 'text-z-text' : ''}`} />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* You */}
                    {isAuthenticated && (
                        <div className="py-3 border-b border-z-border/50">
                            <h3 className="px-3 mb-2 text-base font-semibold text-z-text flex items-center gap-1">
                                You
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 111.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 01-1.41 0c-.38-.39-.39-1.03 0-1.42z" />
                                </svg>
                            </h3>
                            {youLinks.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={`sidebar-item ${isActive(link.to) ? 'sidebar-item-active' : ''}`}
                                >
                                    <link.icon className={`w-5 h-5 ${isActive(link.to) ? 'text-z-text' : ''}`} />
                                    <span>{link.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Explore */}
                    <div className="py-3 border-b border-z-border/50">
                        <h3 className="px-3 mb-2 text-base font-semibold text-z-text">Explore</h3>
                        {exploreLinks.map(link => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                className={`sidebar-item`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Creator */}
                    {isAuthenticated && (
                        <div className="py-3 border-b border-z-border/50">
                            <h3 className="px-3 mb-2 text-base font-semibold text-z-text">Creator</h3>
                            {creatorLinks.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={`sidebar-item ${isActive(link.to) ? 'sidebar-item-active' : ''}`}
                                >
                                    <link.icon className={`w-5 h-5 ${isActive(link.to) ? 'text-z-text' : ''}`} />
                                    <span>{link.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Admin */}
                    {user?.role === 'admin' && (
                        <div className="py-3 border-b border-z-border/50">
                            <NavLink
                                to="/admin"
                                className={`sidebar-item ${isActive('/admin') ? 'sidebar-item-active' : ''}`}
                            >
                                <HiOutlineViewGrid className="w-5 h-5 text-accent-gold" />
                                <span className="gradient-text-gold font-semibold">Admin Panel</span>
                            </NavLink>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="py-3 border-b border-z-border/50">
                        <NavLink
                            to="/settings"
                            className={`sidebar-item ${isActive('/settings') ? 'sidebar-item-active' : ''}`}
                        >
                            <HiOutlineCog className="w-5 h-5" />
                            <span>Settings</span>
                        </NavLink>
                    </div>

                    {/* Sign In Prompt */}
                    {!isAuthenticated && (
                        <div className="py-4 px-3">
                            <p className="text-sm text-z-text-secondary mb-3">
                                Sign in to like videos, comment, and subscribe.
                            </p>
                            <NavLink to="/auth" className="btn-secondary flex items-center gap-2 w-fit">
                                <HiOutlineGlobe className="w-4 h-4" />
                                Sign in
                            </NavLink>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="py-4 px-3 text-xs text-z-text-muted space-y-2">
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            <span>About</span><span>Press</span><span>Copyright</span>
                            <span>Contact</span><span>Creators</span><span>Advertise</span>
                            <span>Developers</span>
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            <span>Terms</span><span>Privacy</span><span>Policy & Safety</span>
                        </div>
                        <p className="pt-2 text-z-text-muted/60">© 2026 Zentube</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
