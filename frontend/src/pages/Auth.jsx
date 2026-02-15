import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.email, form.password);
                toast.success('Welcome back!');
            } else {
                if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
                await register(form.name, form.email, form.password);
                toast.success('Account created!');
            }
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setForm({ name: '', email: '', password: '' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0f0f0f' }}>
            <div className="w-full max-w-md animate-scale-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <img src="/zentube-logo.svg" alt="Zentube" className="w-10 h-10 rounded-xl" />
                        <span className="text-2xl font-bold">
                            <span style={{ color: '#f1f1f1' }}>Zen</span>
                            <span style={{ color: '#ff0000' }}>tube</span>
                        </span>
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="rounded-2xl p-8" style={{ backgroundColor: '#282828', border: '1px solid #3f3f3f' }}>
                    <h1 className="text-2xl font-bold text-center mb-1" style={{ color: '#f1f1f1' }}>
                        {isLogin ? 'Sign in' : 'Create your account'}
                    </h1>
                    <p className="text-sm text-center mb-8" style={{ color: '#717171' }}>
                        {isLogin ? 'to continue to Zentube' : 'Join Zentube to start sharing'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative animate-slide-down">
                                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#717171' }} />
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                    onBlur={(e) => e.target.style.borderColor = '#303030'}
                                    required
                                    id="auth-name"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#717171' }} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                                style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                onBlur={(e) => e.target.style.borderColor = '#303030'}
                                required
                                id="auth-email"
                            />
                        </div>

                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#717171' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full pl-11 pr-12 py-3 rounded-lg text-sm outline-none transition-all"
                                style={{ backgroundColor: '#121212', color: '#f1f1f1', border: '1px solid #303030' }}
                                onFocus={(e) => e.target.style.borderColor = '#1c62b9'}
                                onBlur={(e) => e.target.style.borderColor = '#303030'}
                                required
                                minLength={6}
                                id="auth-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: '#717171' }}
                            >
                                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm transition-colors" style={{ color: '#3ea6ff' }}>
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: '#3ea6ff', color: '#0f0f0f' }}
                            id="auth-submit"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-transparent border-t-current rounded-full animate-spin" />
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </div>
                            ) : (
                                isLogin ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full" style={{ borderTop: '1px solid #3f3f3f' }} />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3" style={{ backgroundColor: '#282828', color: '#717171' }}>or continue with</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                            style={{ backgroundColor: '#272727', color: '#f1f1f1', border: '1px solid #3f3f3f' }}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                            style={{ backgroundColor: '#272727', color: '#f1f1f1', border: '1px solid #3f3f3f' }}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Toggle */}
                    <p className="text-center text-sm mt-6" style={{ color: '#717171' }}>
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button onClick={toggleMode} className="font-semibold transition-colors" style={{ color: '#3ea6ff' }}>
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Terms */}
                <p className="text-center text-xs mt-4" style={{ color: '#717171' }}>
                    By continuing, you agree to Zentube's{' '}
                    <span className="cursor-pointer" style={{ color: '#3ea6ff' }}>Terms of Service</span> and{' '}
                    <span className="cursor-pointer" style={{ color: '#3ea6ff' }}>Privacy Policy</span>
                </p>
            </div>
        </div>
    );
};

export default Auth;
