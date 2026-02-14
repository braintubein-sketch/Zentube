import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineFolder, HiOutlinePlus, HiOutlineLockClosed, HiOutlineGlobe } from 'react-icons/hi';

const Playlists = () => {
    const [playlists, setPlaylists] = useState([
        {
            _id: '1',
            name: 'Watch Later',
            isDefault: true,
            videoCount: 0,
            thumbnail: null,
            visibility: 'private',
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '2',
            name: 'Liked Videos',
            isDefault: true,
            videoCount: 0,
            thumbnail: null,
            visibility: 'private',
            updatedAt: new Date().toISOString(),
        }
    ]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({ name: '', visibility: 'private' });

    const handleCreatePlaylist = () => {
        if (!newPlaylist.name.trim()) return;
        setPlaylists(prev => [...prev, {
            _id: Date.now().toString(),
            name: newPlaylist.name,
            isDefault: false,
            videoCount: 0,
            thumbnail: null,
            visibility: newPlaylist.visibility,
            updatedAt: new Date().toISOString(),
        }]);
        setNewPlaylist({ name: '', visibility: 'private' });
        setShowCreateModal(false);
    };

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Playlists</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" />
                    New playlist
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {playlists.map(playlist => (
                    <Link
                        key={playlist._id}
                        to={playlist.name === 'Watch Later' ? '/watch-later' : playlist.name === 'Liked Videos' ? '/liked-videos' : '#'}
                        className="group"
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-z-surface mb-2">
                            {playlist.thumbnail ? (
                                <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-z-surface to-z-elevated">
                                    <HiOutlineFolder className="w-12 h-12 text-z-text-muted" />
                                </div>
                            )}
                            {/* Playlist overlay */}
                            <div className="absolute inset-y-0 right-0 w-2/5 bg-black/70 backdrop-blur-sm
                flex flex-col items-center justify-center gap-1
                group-hover:bg-black/80 transition-colors">
                                <span className="text-lg font-bold">{playlist.videoCount}</span>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-medium text-sm text-z-text group-hover:text-z-text transition-colors">{playlist.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-z-text-muted mt-0.5">
                            {playlist.visibility === 'private' ? (
                                <HiOutlineLockClosed className="w-3.5 h-3.5" />
                            ) : (
                                <HiOutlineGlobe className="w-3.5 h-3.5" />
                            )}
                            <span>{playlist.videoCount} videos</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">New playlist</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={newPlaylist.name}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                                    placeholder="Enter playlist title..."
                                    className="input-field"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Visibility</label>
                                <select
                                    value={newPlaylist.visibility}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, visibility: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="private">Private</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowCreateModal(false)} className="btn-ghost">Cancel</button>
                                <button onClick={handleCreatePlaylist} className="btn-primary" disabled={!newPlaylist.name.trim()}>
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlists;
