import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../api';
import toast from 'react-hot-toast';
import {
    HiOutlineUpload, HiOutlineFilm, HiOutlinePhotograph,
    HiOutlineX, HiOutlineCheck, HiOutlineGlobe, HiOutlineLockClosed
} from 'react-icons/hi';

const CATEGORIES = ['Entertainment', 'Music', 'Gaming', 'Education', 'Tech', 'Sports', 'News', 'Vlogs', 'Movies', 'Other'];

const Upload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('select'); // select, details, uploading
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Entertainment',
        tags: '',
        isShort: false,
        visibility: 'public',
    });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) return toast.error('Please select a video file');
        if (file.size > 500 * 1024 * 1024) return toast.error('Max file size: 500MB');

        setVideoFile(file);
        setForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
        setVideoPreview(URL.createObjectURL(file));
        setStep('details');
    };

    const handleThumbnailSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) return toast.error('Please select a video');
        if (!form.title.trim()) return toast.error('Title is required');

        setStep('uploading');
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('isShort', form.isShort);
            if (form.tags) formData.append('tags', form.tags);

            await videoAPI.uploadVideo(formData, {
                onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
            });

            toast.success('Video uploaded successfully! 🎉');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
            setStep('details');
        }
    };

    // Step 1: File Select
    if (step === 'select') {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Upload video</h1>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-z-border
            rounded-2xl cursor-pointer hover:border-brand/40 hover:bg-brand/[0.02] transition-all group"
                >
                    <div className="w-24 h-24 rounded-full bg-z-surface flex items-center justify-center mb-6
            group-hover:bg-brand/10 transition-colors">
                        <HiOutlineUpload className="w-10 h-10 text-z-text-muted group-hover:text-brand transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drag and drop video files to upload</h3>
                    <p className="text-sm text-z-text-muted mb-6">Your videos will be private until you publish them</p>
                    <button className="btn-primary">SELECT FILES</button>
                    <p className="text-xs text-z-text-muted mt-4">MP4, WebM, MOV • Up to 500MB</p>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                </div>
            </div>
        );
    }

    // Step 3: Uploading
    if (step === 'uploading') {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="#272727" />
                        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="url(#gradient)"
                            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - uploadProgress / 100)}`}
                            className="transition-all duration-300" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#9147ff" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold gradient-text">{uploadProgress}%</span>
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-2">Uploading your video...</h2>
                <p className="text-sm text-z-text-muted">
                    {uploadProgress < 100 ? 'Please keep this page open' : 'Processing...'}
                </p>
            </div>
        );
    }

    // Step 2: Details
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Upload video</h1>
                <div className="flex gap-2">
                    <button onClick={() => { setStep('select'); setVideoFile(null); }} className="btn-ghost">Cancel</button>
                    <button onClick={handleUpload} className="btn-primary">Upload</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-semibold mb-4">Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Title (required)</label>
                                <input type="text" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="input-field" placeholder="Add a title that describes your video"
                                    maxLength={100} required />
                                <p className="text-xs text-z-text-muted mt-1 text-right">{form.title.length}/100</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Description</label>
                                <textarea value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input-field h-32 resize-none"
                                    placeholder="Tell viewers about your video"
                                    maxLength={5000} />
                                <p className="text-xs text-z-text-muted mt-1 text-right">{form.description.length}/5000</p>
                            </div>

                            {/* Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Thumbnail</label>
                                <p className="text-xs text-z-text-muted mb-2">Select or upload a picture that shows what's in your video</p>
                                <div className="flex gap-3">
                                    <label className="w-36 aspect-video border-2 border-dashed border-z-border rounded-lg
                    flex flex-col items-center justify-center cursor-pointer hover:border-brand/40 transition-colors">
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <>
                                                <HiOutlinePhotograph className="w-6 h-6 text-z-text-muted" />
                                                <span className="text-xs text-z-text-muted mt-1">Upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Category</label>
                                <select value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="input-field max-w-xs">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Tags</label>
                                <input type="text" value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    className="input-field" placeholder="Separate tags with commas (e.g. music, tutorial, vlog)" />
                            </div>

                            {/* Shorts toggle */}
                            <div className="flex items-center justify-between bg-z-surface rounded-xl p-4">
                                <div>
                                    <p className="text-sm font-medium">Upload as Short</p>
                                    <p className="text-xs text-z-text-muted mt-0.5">Vertical videos under 60 seconds</p>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, isShort: !form.isShort })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isShort ? 'bg-brand' : 'bg-z-surface-hover'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isShort ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-semibold mb-4">Visibility</h2>
                        <div className="space-y-2">
                            {[
                                { id: 'public', label: 'Public', desc: 'Everyone can search and view', icon: HiOutlineGlobe },
                                { id: 'unlisted', label: 'Unlisted', desc: 'Anyone with the link can view', icon: HiOutlineFilm },
                                { id: 'private', label: 'Private', desc: 'Only you can view', icon: HiOutlineLockClosed },
                            ].map(opt => (
                                <label key={opt.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${form.visibility === opt.id ? 'border-brand bg-brand/5' : 'border-z-border hover:bg-z-surface'
                                        }`}>
                                    <input type="radio" name="visibility" value={opt.id}
                                        checked={form.visibility === opt.id}
                                        onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                                        className="hidden" />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.visibility === opt.id ? 'border-brand' : 'border-z-text-muted'
                                        }`}>
                                        {form.visibility === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                                    </div>
                                    <opt.icon className="w-5 h-5 text-z-text-secondary" />
                                    <div>
                                        <p className="text-sm font-medium">{opt.label}</p>
                                        <p className="text-xs text-z-text-muted">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card-elevated overflow-hidden sticky top-20">
                        <div className="aspect-video bg-black">
                            {videoPreview && (
                                <video src={videoPreview} controls className="w-full h-full" />
                            )}
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div>
                                <p className="text-z-text-muted text-xs">Filename</p>
                                <p className="truncate">{videoFile?.name}</p>
                            </div>
                            <div>
                                <p className="text-z-text-muted text-xs">Size</p>
                                <p>{(videoFile?.size / (1024 * 1024)).toFixed(1)} MB</p>
                            </div>
                            <div>
                                <p className="text-z-text-muted text-xs">Link</p>
                                <p className="text-brand text-xs">Generated after upload</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
