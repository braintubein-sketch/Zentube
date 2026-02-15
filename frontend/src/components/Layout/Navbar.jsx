import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    HiOutlineSearch, HiOutlineBell, HiOutlinePlus,
    HiOutlineVideoCamera, HiOutlineMicrophone,
    HiOutlineMenu, HiOutlineX, HiOutlineCog,
    HiOutlineLogout, HiOutlineUser, HiOutlineViewGrid,
    HiOutlineMoon, HiOutlineSun, HiOutlineUpload,
    HiOutlineFilm, HiOutlinePencilAlt, HiOutlineChartBar
} from 'react-icons/hi';

const Navbar = ({ onToggleSidebar }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const userMenuRef = useRef(null);
    const createMenuRef = useRef(null);
    const notifRef = useRef(null);

    const notificationCount = 3; // Placeholder

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
            if (createMenuRef.current && !createMenuRef.current.contains(e.target)) setShowCreateMenu(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setShowUserMenu(false);
        setShowCreateMenu(false);
        setShowNotifications(false);
        setShowMobileSearch(false);
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-md border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--z-bg) 95%, transparent)', borderColor: 'var(--z-border)' }}>
            <div className="flex items-center justify-between h-full px-4">
                {/* Left: Menu + Logo */}
                <div className="flex items-center gap-2 min-w-[200px]">
                    <button onClick={onToggleSidebar} className="btn-icon" id="menu-toggle" aria-label="Toggle menu">
                        <HiOutlineMenu className="w-5 h-5" />
                    </button>
                    <Link to="/" className="flex items-center gap-1.5 group" id="logo-link">
                        <img
                            src="/zentube-logo.png"
                            alt="Zentube"
                            className="w-8 h-8 rounded-lg shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300"
                        />
                        <span className="text-lg font-bold tracking-tight hidden sm:block">
                            <span className="text-z-text">Zen</span>
                            <span className="gradient-text">tube</span>
                        </span>
                    </Link>
                </div>

                {/* Center: Search Bar */}
                <div className={`flex-1 max-w-2xl mx-4 ${showMobileSearch ? 'flex' : 'hidden md:flex'} items-center gap-2`}>
                    <form onSubmit={handleSearch} className="flex flex-1 items-center">
                        <div className={`flex flex-1 items-center rounded-full border overflow-hidden transition-all duration-200
              ${searchFocused ? 'border-brand/70 shadow-[0_0_8px_rgba(145,71,255,0.15)]' : 'border-z-border'}`}>
                            {searchFocused && (
                                <div className="pl-4">
                                    <HiOutlineSearch className="w-4 h-4 text-z-text-muted" />
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="flex-1 bg-transparent text-sm text-z-text px-4 py-2 outline-none
                  placeholder:text-z-text-muted"
                                id="search-input"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-z-surface hover:bg-z-surface-hover border border-z-border
                border-l-0 rounded-r-full transition-colors"
                            aria-label="Search"
                        >
                            <HiOutlineSearch className="w-5 h-5 text-z-text-secondary" />
                        </button>
                    </form>
                    <button className="btn-icon bg-z-surface hover:bg-z-surface-hover hidden lg:flex" aria-label="Voice search">
                        <HiOutlineMicrophone className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 min-w-[200px] justify-end">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="Toggle theme"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? (
                            <HiOutlineSun className="icon" />
                        ) : (
                            <HiOutlineMoon className="icon" />
                        )}
                    </button>

                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className="btn-icon md:hidden"
                    >
                        {showMobileSearch ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineSearch className="w-5 h-5" />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            {/* Create Button */}
                            <div ref={createMenuRef} className="relative">
                                <button
                                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                                    className="btn-icon relative group"
                                    id="create-btn"
                                >
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full
                    bg-z-surface hover:bg-z-surface-hover transition-colors">
                                        <HiOutlinePlus className="w-5 h-5" />
                                        <span className="text-sm font-medium hidden lg:block">Create</span>
                                    </div>
                                </button>

                                {showCreateMenu && (
                                    <div className="dropdown-menu right-0 top-12 w-56" id="create-menu">
                                        <Link to="/upload" className="dropdown-item" id="upload-video-link">
                                            <HiOutlineUpload className="w-5 h-5" />
                                            <div>
                                                <p className="font-medium">Upload video</p>
                                                <p className="text-xs text-z-text-muted">Share your content</p>
                                            </div>
                                        </Link>
                                        <button className="dropdown-item w-full">
                                            <HiOutlineFilm className="w-5 h-5" />
                                            <div className="text-left">
                                                <p className="font-medium">Create a Short</p>
                                                <p className="text-xs text-z-text-muted">Vertical short video</p>
                                            </div>
                                        </button>
                                        <button className="dropdown-item w-full">
                                            <HiOutlinePencilAlt className="w-5 h-5" />
                                            <div className="text-left">
                                                <p className="font-medium">Create post</p>
                                                <p className="text-xs text-z-text-muted">Share with community</p>
                                            </div>
                                        </button>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item w-full">
                                            <HiOutlineVideoCamera className="w-5 h-5 text-accent-rose" />
                                            <div className="text-left">
                                                <p className="font-medium">Go live</p>
                                                <p className="text-xs text-z-text-muted">Start streaming</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <div ref={notifRef} className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="btn-icon relative"
                                    id="notifications-btn"
                                >
                                    <HiOutlineBell className="w-5 h-5" />
                                    {notificationCount > 0 && (
                                        <span className="notification-badge">{notificationCount}</span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="dropdown-menu right-0 top-12 w-96 max-h-[70vh] overflow-y-auto" id="notifications-menu">
                                        <div className="px-4 py-3 border-b border-z-border flex items-center justify-between">
                                            <h3 className="font-semibold">Notifications</h3>
                                            <button className="text-xs text-brand hover:text-brand-light">Mark all read</button>
                                        </div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="dropdown-item py-3">
                                                <div className="avatar avatar-sm bg-brand/20 flex items-center justify-center shrink-0">
                                                    <HiOutlineVideoCamera className="w-4 h-4 text-brand" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm line-clamp-2">
                                                        <span className="font-semibold">Creator Name</span> uploaded a new video: "Amazing Content #{i}"
                                                    </p>
                                                    <p className="text-xs text-z-text-muted mt-0.5">{i} hour{i > 1 ? 's' : ''} ago</p>
                                                </div>
                                                <div className="w-16 aspect-video rounded bg-z-surface shrink-0" />
                                            </div>
                                        ))}
                                        <div className="p-3 text-center border-t border-z-border">
                                            <button className="text-sm text-brand hover:text-brand-light font-medium">See all notifications</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Menu */}
                            <div ref={userMenuRef} className="relative ml-1">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="focus:outline-none"
                                    id="user-menu-btn"
                                >
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=9147ff&color=fff&size=80`}
                                        alt={user?.name}
                                        className="avatar avatar-sm hover:ring-2 hover:ring-brand/50 transition-all"
                                    />
                                </button>

                                {showUserMenu && (
                                    <div className="dropdown-menu right-0 top-12 w-72" id="user-dropdown">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-z-border">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=9147ff&color=fff&size=80`}
                                                    alt={user?.name}
                                                    className="avatar avatar-lg"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{user?.name}</p>
                                                    <p className="text-sm text-z-text-muted truncate">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
                                                    <Link to={`/channel/${user?._id}`} className="text-sm text-brand hover:text-brand-light mt-1 block">
                                                        View your channel
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        <Link to={`/channel/${user?._id}`} className="dropdown-item">
                                            <HiOutlineUser className="w-5 h-5" /> Your channel
                                        </Link>
                                        <Link to="/dashboard" className="dropdown-item">
                                            <HiOutlineChartBar className="w-5 h-5" /> Zentube Studio
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <Link to="/settings" className="dropdown-item">
                                            <HiOutlineCog className="w-5 h-5" /> Settings
                                        </Link>
                                        <div className="dropdown-divider" />
                                        {user?.role === 'admin' && (
                                            <>
                                                <Link to="/admin" className="dropdown-item">
                                                    <HiOutlineViewGrid className="w-5 h-5 text-accent-gold" />
                                                    <span className="gradient-text-gold font-semibold">Admin Panel</span>
                                                </Link>
                                                <div className="dropdown-divider" />
                                            </>
                                        )}
                                        <button onClick={handleLogout} className="dropdown-item w-full text-accent-rose">
                                            <HiOutlineLogout className="w-5 h-5" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/auth" className="btn-secondary flex items-center gap-2" id="signin-btn">
                            <HiOutlineUser className="w-4 h-4" />
                            <span className="text-sm font-semibold">Sign in</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
