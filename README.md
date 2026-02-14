# 🎬 Zentro - Video Streaming Platform

A full-stack, production-ready video streaming platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

![Zentro](https://img.shields.io/badge/Zentro-Video_Platform-8b5cf6?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-3b82f6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📁 Project Structure

```
ZENTRO/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── user.controller.js    # User/Channel management
│   │   ├── video.controller.js   # Video CRUD & interactions
│   │   ├── comment.controller.js # Comments system
│   │   ├── admin.controller.js   # Admin dashboard & management
│   │   └── search.controller.js  # Search functionality
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── errorHandler.js       # Centralized error handling
│   │   └── upload.js             # Multer file upload config
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Video.js              # Video schema
│   │   ├── Comment.js            # Comment schema
│   │   └── Report.js             # Report schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── admin.routes.js
│   │   └── search.routes.js
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── zentro-icon.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js          # Axios API layer
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   └── VideoCardSkeleton.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Watch.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Channel.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Shorts.jsx
│   │   │   ├── History.jsx
│   │   │   ├── WatchLater.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── Trending.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── EditVideo.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## ✨ Features

### 👤 User Features
- **Authentication**: Register/Login with JWT tokens
- **Profile Management**: Avatar, banner, bio, channel name
- **Video Player**: HTML5 video with HD support
- **Social Interactions**: Like, dislike, comment, share
- **Subscribe** to channels
- **Watch Later** saved playlist
- **Watch History** tracking
- **Search** with filters (category, type, sort)
- **Category Filtering**: Education, Gaming, Tech, Entertainment, Music, Movies, Vlogs, etc.
- **Shorts**: Vertical scroll feed (TikTok-style)
- **Trending Videos** page
- **Recommended Videos** sidebar
- **Report Content** feature

### 🎬 Creator Features
- **Upload Videos** with Cloudinary storage (up to 500MB)
- **Custom Thumbnails**
- **Creator Dashboard** with analytics (views, likes, comments, subscribers)
- **Edit/Delete** videos
- **Monetization Toggle** (Phase 2 ready)

### 🛡️ Admin Features
- **Admin Dashboard** with platform-wide analytics
- **Manage Users** (search, delete)
- **Manage Videos** (view all, delete)
- **Report Moderation** (resolve, dismiss)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, TailwindCSS 3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Storage** | Cloudinary (Video & Image) |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Icons** | React Icons (Heroicons) |
| **Notifications** | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ZENTRO

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user (username/password)
4. Whitelist your IP (or use `0.0.0.0/0` for all IPs)
5. Click "Connect" → "Connect your application"
6. Copy the connection string

### 3. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 4. Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/zentro
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 5. Run the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend  
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 📡 API Routes

### Authentication
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Videos
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/videos` | Get all videos | ❌ |
| POST | `/api/videos` | Upload video | ✅ |
| GET | `/api/videos/shorts` | Get shorts | ❌ |
| GET | `/api/videos/trending` | Get trending | ❌ |
| GET | `/api/videos/:id` | Get single video | ❌ |
| PUT | `/api/videos/:id` | Update video | ✅ |
| DELETE | `/api/videos/:id` | Delete video | ✅ |
| POST | `/api/videos/:id/like` | Like/Unlike video | ✅ |
| POST | `/api/videos/:id/dislike` | Dislike video | ✅ |
| POST | `/api/videos/:id/report` | Report video | ✅ |
| GET | `/api/videos/:id/recommended` | Get recommended | ❌ |

### Users
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/users/:id` | Get user profile | ❌ |
| GET | `/api/users/:id/videos` | Get user's videos | ❌ |
| POST | `/api/users/:id/subscribe` | Toggle subscribe | ✅ |
| GET | `/api/users/history` | Get watch history | ✅ |
| POST | `/api/users/history/:videoId` | Add to history | ✅ |
| GET | `/api/users/watchlater` | Get watch later | ✅ |
| POST | `/api/users/watchlater/:videoId` | Toggle watch later | ✅ |
| GET | `/api/users/subscriptions/feed` | Subscription feed | ✅ |

### Comments
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/comments/:videoId` | Get comments | ❌ |
| POST | `/api/comments/:videoId` | Add comment | ✅ |
| DELETE | `/api/comments/:id` | Delete comment | ✅ |
| POST | `/api/comments/:id/like` | Like comment | ✅ |

### Search
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/search?q=...` | Search videos/channels | ❌ |

### Admin
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/stats` | Dashboard stats | 🛡️ Admin |
| GET | `/api/admin/users` | Get all users | 🛡️ Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 🛡️ Admin |
| GET | `/api/admin/reports` | Get reports | 🛡️ Admin |
| PATCH | `/api/admin/reports/:id` | Update report | 🛡️ Admin |
| GET | `/api/admin/videos` | Get all videos | 🛡️ Admin |

---

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  banner: String,
  bio: String,
  channelName: String,
  subscribers: [ObjectId -> User],
  subscriptions: [ObjectId -> User],
  watchHistory: [{ video: ObjectId, watchedAt: Date }],
  watchLater: [ObjectId -> Video],
  role: 'user' | 'admin',
  isMonetized: Boolean,
  createdAt, updatedAt
}
```

### Video
```javascript
{
  title: String,
  description: String,
  videoUrl: String,
  thumbnail: String,
  duration: Number,
  category: String,
  tags: [String],
  owner: ObjectId -> User,
  views: Number,
  likes: [ObjectId -> User],
  dislikes: [ObjectId -> User],
  isShort: Boolean,
  isPublished: Boolean,
  isReported: Boolean,
  reports: [{ user, reason, createdAt }],
  commentCount: Number,
  createdAt, updatedAt
}
```

### Comment
```javascript
{
  text: String,
  user: ObjectId -> User,
  video: ObjectId -> Video,
  likes: [ObjectId -> User],
  parentComment: ObjectId -> Comment,
  createdAt, updatedAt
}
```

### Report
```javascript
{
  reporter: ObjectId -> User,
  video: ObjectId -> Video,
  reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'misinformation' | 'other',
  description: String,
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  createdAt, updatedAt
}
```

---

## 🚢 Deployment

### Backend → Render / Railway

1. Push code to GitHub
2. Go to [Render](https://render.com) or [Railway](https://railway.app)
3. Create a new **Web Service**
4. Connect your GitHub repo
5. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables from `.env`

### Frontend → Vercel / Netlify

1. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Import your GitHub repo
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Post-Deployment
- Update `CLIENT_URL` in backend env to your frontend URL
- Update `VITE_API_URL` in frontend env to your backend URL

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT token authentication with expiration
- ✅ Role-based access control (user/admin)
- ✅ Input validation & sanitization
- ✅ Rate limiting (500 req/15min per IP)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Centralized error handling

---

## 💰 Monetization (Phase 2 Ready)

The platform includes infrastructure for:
- User `isMonetized` flag
- Placeholder for ad integration
- Premium subscription model structure
- Razorpay/Stripe integration points
- Creator revenue model via the Dashboard

---

## ⚡ Performance

- Lazy loading images with `loading="lazy"`
- Pagination on all list endpoints
- MongoDB indexes on frequently queried fields
- Efficient text search indexes
- Code splitting via Vite manual chunks
- CDN-ready Cloudinary video delivery
- Optimized MongoDB queries with lean population
- Scalable architecture for 100k+ users

---

## 📄 License

MIT License - feel free to use this project for any purpose.

---

**Built with ❤️ by Zentro Team**
