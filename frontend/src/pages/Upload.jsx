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
    const [step, setStep] = useState('select');
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

            toast.success('Video uploaded successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
            setStep('details');
        }
    };

    const inputStyle = {
        backgroundColor: '#121212',
        color: '#f1f1f1',
        border: '1px solid #303030',
    };

    // Step 1: File Select
    if (step === 'select') {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6" style={{ color: '#f1f1f1' }}>Upload video</h1>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all group"
                    style={{ borderColor: '#3f3f3f', backgroundColor: '#212121' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff0000'; e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f3f3f'; e.currentTarget.style.backgroundColor = '#212121'; }}
                >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors"
                        style={{ backgroundColor: '#272727' }}>
                        <HiOutlineUpload className="w-10 h-10" style={{ color: '#aaaaaa' }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#f1f1f1' }}>Drag and drop video files to upload</h3>
                    <p className="text-sm mb-6" style={{ color: '#717171' }}>Your videos will be private until you publish them</p>
                    <button className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity"
                        style={{ backgroundColor: '#3ea6ff', color: '#0f0f0f' }}>
                        SELECT FILES
                    </button>
                    <p className="text-xs mt-4" style={{ color: '#717171' }}>MP4, WebM, MOV • Up to 500MB</p>
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
                        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="#ff0000"
                            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - uploadProgress / 100)}`}
                            className="transition-all duration-300" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: '#ff0000' }}>{uploadProgress}%</span>
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f1f1' }}>Uploading your video...</h2>
                <p className="text-sm" style={{ color: '#717171' }}>
                    {uploadProgress < 100 ? 'Please keep this page open' : 'Processing...'}
                </p>
                {/* Upload progress bar */}
                <div className="mt-6 mx-auto max-w-xs h-1 rounded-full" style={{ backgroundColor: '#272727' }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: '#ff0000' }} />
                </div>
            </div>
        );
    }

    // Step 2: Details
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#f1f1f1' }}>Upload video</h1>
                <div className="flex gap-2">
                    <button onClick={() => { setStep('select'); setVideoFile(null); }}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#272727', color: '#f1f1f1' }}>
                        Cancel
                    </button>
                    <button onClick={handleUpload}
                        className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity"
                        style={{ backgroundColor: '#3ea6ff', color: '#0f0f0f' }}>
                        Upload
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#f1f1f1' }}>Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Title (required)</label>
                                <input type="text" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                    placeholder="Add a title that describes your video"
                                    maxLength={100} required />
                                <p className="text-xs mt-1 text-right" style={{ color: '#717171' }}>{form.title.length}/100</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Description</label>
                                <textarea value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all h-32 resize-none"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                    placeholder="Tell viewers about your video"
                                    maxLength={5000} />
                                <p className="text-xs mt-1 text-right" style={{ color: '#717171' }}>{form.description.length}/5000</p>
                            </div>

                            {/* Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Thumbnail</label>
                                <p className="text-xs mb-2" style={{ color: '#717171' }}>Select a picture that shows what's in your video</p>
                                <div className="flex gap-3">
                                    <label className="w-36 aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
                                        style={{ borderColor: '#3f3f3f' }}>
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <>
                                                <HiOutlinePhotograph className="w-6 h-6" style={{ color: '#717171' }} />
                                                <span className="text-xs mt-1" style={{ color: '#717171' }}>Upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Category</label>
                                <select value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="px-4 py-3 rounded-lg text-sm outline-none max-w-xs"
                                    style={inputStyle}>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aaaaaa' }}>Tags</label>
                                <input type="text" value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                    placeholder="Separate tags with commas (e.g. music, tutorial, vlog)" />
                            </div>

                            {/* Shorts toggle */}
                            <div className="flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: '#272727' }}>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#f1f1f1' }}>Upload as Short</p>
                                    <p className="text-xs mt-0.5" style={{ color: '#717171' }}>Vertical videos under 60 seconds</p>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, isShort: !form.isShort })}
                                    className="relative w-11 h-6 rounded-full transition-colors"
                                    style={{ backgroundColor: form.isShort ? '#3ea6ff' : '#3f3f3f' }}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isShort ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#f1f1f1' }}>Visibility</h2>
                        <div className="space-y-2">
                            {[
                                { id: 'public', label: 'Public', desc: 'Everyone can search and view', icon: HiOutlineGlobe },
                                { id: 'unlisted', label: 'Unlisted', desc: 'Anyone with the link can view', icon: HiOutlineFilm },
                                { id: 'private', label: 'Private', desc: 'Only you can view', icon: HiOutlineLockClosed },
                            ].map(opt => (
                                <label key={opt.id}
                                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all"
                                    style={form.visibility === opt.id
                                        ? { borderColor: '#3ea6ff', backgroundColor: 'rgba(62,166,255,0.05)' }
                                        : { borderColor: '#3f3f3f', backgroundColor: 'transparent' }
                                    }>
                                    <input type="radio" name="visibility" value={opt.id}
                                        checked={form.visibility === opt.id}
                                        onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                                        className="hidden" />
                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                        style={{ borderColor: form.visibility === opt.id ? '#3ea6ff' : '#717171' }}>
                                        {form.visibility === opt.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3ea6ff' }} />}
                                    </div>
                                    <opt.icon className="w-5 h-5" style={{ color: '#aaaaaa' }} />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: '#f1f1f1' }}>{opt.label}</p>
                                        <p className="text-xs" style={{ color: '#717171' }}>{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Sidebar */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl overflow-hidden sticky top-20" style={{ backgroundColor: '#212121', border: '1px solid #3f3f3f' }}>
                        <div className="aspect-video bg-black">
                            {videoPreview && (
                                <video src={videoPreview} controls className="w-full h-full" />
                            )}
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div>
                                <p className="text-xs" style={{ color: '#717171' }}>Filename</p>
                                <p className="truncate" style={{ color: '#f1f1f1' }}>{videoFile?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#717171' }}>Size</p>
                                <p style={{ color: '#f1f1f1' }}>{(videoFile?.size / (1024 * 1024)).toFixed(1)} MB</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#717171' }}>Link</p>
                                <p className="text-xs" style={{ color: '#3ea6ff' }}>Generated after upload</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
