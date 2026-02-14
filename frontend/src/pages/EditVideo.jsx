import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../api';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineArrowLeft } from 'react-icons/hi';

const CATEGORIES = ['Entertainment', 'Music', 'Gaming', 'Education', 'Tech', 'Sports', 'News', 'Vlogs', 'Movies', 'Other'];

const EditVideo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', category: 'Entertainment', tags: '', isPublished: true, isShort: false,
    });

    useEffect(() => { fetchVideo(); }, [id]);

    const fetchVideo = async () => {
        try {
            const { data } = await videoAPI.getVideo(id);
            const v = data.video;
            setForm({
                title: v.title || '',
                description: v.description || '',
                category: v.category || 'Entertainment',
                tags: v.tags?.join(', ') || '',
                isPublished: v.isPublished !== false,
                isShort: v.isShort || false,
            });
            setThumbnailPreview(v.thumbnail);
        } catch {
            toast.error('Video not found');
            navigate('/dashboard');
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            const thumbInput = document.getElementById('edit-thumbnail');
            if (thumbInput?.files[0]) formData.append('thumbnail', thumbInput.files[0]);

            await videoAPI.updateVideo(id, formData);
            toast.success('Video updated!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update');
        } finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/dashboard')} className="btn-icon">
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Edit video</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="card-elevated p-6 space-y-4">
                            <h2 className="text-lg font-semibold">Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Title</label>
                                <input type="text" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="input-field" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Description</label>
                                <textarea value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input-field h-32 resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Category</label>
                                    <select value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="input-field">
                                        {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Tags</label>
                                    <input type="text" value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        className="input-field" placeholder="tag1, tag2, tag3" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Thumbnail</label>
                                <div className="flex gap-3 items-center">
                                    <label className="w-36 aspect-video border-2 border-dashed border-z-border rounded-lg
                    flex items-center justify-center cursor-pointer overflow-hidden hover:border-brand/40 transition-colors">
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <HiOutlinePhotograph className="w-6 h-6 text-z-text-muted" />
                                        )}
                                        <input type="file" accept="image/*" className="hidden" id="edit-thumbnail"
                                            onChange={(e) => {
                                                if (e.target.files[0]) setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                                            }} />
                                    </label>
                                    <p className="text-xs text-z-text-muted">Click to change thumbnail</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-elevated p-6 space-y-4">
                            <h2 className="text-lg font-semibold">Visibility</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{form.isPublished ? 'Published' : 'Private'}</p>
                                    <p className="text-xs text-z-text-muted">{form.isPublished ? 'Everyone can see this video' : 'Only you can see this video'}</p>
                                </div>
                                <button type="button"
                                    onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-brand' : 'bg-z-surface-hover'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card-elevated p-4 sticky top-20 space-y-4">
                            <h3 className="font-semibold">Preview</h3>
                            {thumbnailPreview && (
                                <div className="aspect-video rounded-lg overflow-hidden bg-z-surface">
                                    <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="text-sm">
                                <p className="font-medium line-clamp-2">{form.title || 'Untitled'}</p>
                                <p className="text-xs text-z-text-muted mt-1">{form.category}</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditVideo;
