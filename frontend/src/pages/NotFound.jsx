import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-[128px]" />
            </div>

            <div className="relative text-center animate-scale-up">
                <h1 className="text-8xl md:text-9xl font-black gradient-text-premium mb-4">404</h1>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">This page isn't available</h2>
                <p className="text-z-text-muted mb-8 max-w-md mx-auto">
                    Sorry, the page you're looking for doesn't exist. Try searching for something else.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/" className="btn-primary">Go to Home</Link>
                    <button onClick={() => window.history.back()} className="btn-secondary">Go Back</button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
