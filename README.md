# VideoTube - Modern Full-Stack Video & Community Platform (Frontend)

A sleek, responsive, and feature-rich YouTube & Twitter (X) hybrid web application built with **React 18**, **Vite**, and **Vanilla CSS**. Designed with modern aesthetics, dark-mode first design, glassmorphism, and responsive micro-animations.

---

## 🚀 Key Features

### 🎬 Video Experience
- **Video Feed & Search**: Browse videos with pagination, search by title/description or creator handle (`@username`), and sort by Newest or Most Viewed.
- **Video Player**: High-definition video playback with view counting and watch history tracking.
- **Engagement**: Like/unlike videos with instant optimistic counters and subscribe/unsubscribe to channels with live subscriber counts.
- **Playlists**: Create custom playlists, add/remove videos via modal, and manage playlist details.
- **Nested Comments**: Paginated comment feed with creation, in-place editing, deletion, and like toggling.

### 💬 Community Posts (Tweets)
- **Community Feed**: Post thoughts, updates, and polls to your subscribers or the global community.
- **Interactive Cards**: Like tweets with real-time counters, edit your posts, and delete them with confirmation.
- **Channel Community Tab**: Dedicated posts tab on creator channel profiles.

### 📊 Creator Dashboard & Analytics
- **Channel Overview**: Live stats for total views, subscribers, total likes, and total uploaded videos.
- **Video Management**: Table view to toggle publish/draft status, edit video titles & descriptions, or delete videos.
- **Post Management**: View, edit, and manage all your published community posts in one place.

### 👤 User Profiles & Customization
- **Channel Profiles**: View any creator's channel with custom cover banners, avatars, uploaded videos, and community posts.
- **Subscriptions & Followers**: Dedicated tabbed management to follow/unfollow creators and view your subscribers.
- **Watch History & Liked Videos**: Quickly access your recently watched videos or liked video collections.
- **Account Settings**: Update account details (full name, email), change passwords, and upload custom avatars and channel cover images.

---

## 🛠️ Tech Stack & Architecture

- **Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/) (Browser router, protected routes, URL search params)
- **HTTP Client**: [Axios](https://axios-http.com/)
  - Automatic `Authorization: Bearer <token>` header injection
  - Request/response interceptors with automatic 401 handling and refresh token rotation
  - Cross-Origin credential support (`withCredentials: true`)
- **State & Context**: React Context API (`AuthContext` for authentication, session recovery, and user state)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Heroicons `Hi*`)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Design System**: Vanilla CSS using custom CSS variables (tokens for colors, spacing, borders, radius, transitions), responsive grid systems, and glassmorphic blur effects.

---

## 📁 Project Structure

```text
Frontend/
├── public/                 # Static assets
├── src/
│   ├── api/                # API client configuration and backend endpoints
│   │   ├── axios.js        # Axios instance with interceptors and token refresh
│   │   └── index.js        # API service methods (Auth, Video, Like, Comment, etc.)
│   ├── components/         # Reusable UI & feature components
│   │   ├── Layout/         # App layout shell, Navbar, and collapsible Sidebar
│   │   ├── Tweet/          # TweetCard and tweet composer components
│   │   ├── UI/             # Core UI design primitives:
│   │   │   ├── Avatar.jsx      # Avatar with initials & image fallback
│   │   │   ├── Button.jsx      # Button variants (primary, secondary, ghost, danger)
│   │   │   ├── EmptyState.jsx  # Glassmorphic empty-state placeholder
│   │   │   ├── Loader.jsx      # Loading spinners and animations
│   │   │   ├── Modal.jsx       # Accessible modal dialogs
│   │   │   ├── Pagination.jsx  # Reusable pagination control
│   │   │   ├── TabBar.jsx      # Accessible tab navigation with badges
│   │   │   └── index.js        # Central UI barrel export
│   │   ├── Video/          # VideoCard, VideoGrid, and skeleton loaders
│   │   └── ProtectedRoute.jsx  # Route guard for authenticated views
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state, login, register, logout, profile
│   ├── pages/              # Application pages / views
│   │   ├── ChannelPage.jsx       # Creator profile & community tab
│   │   ├── CommunityPage.jsx     # Global community posts feed
│   │   ├── DashboardPage.jsx     # Creator analytics & content manager
│   │   ├── HistoryPage.jsx       # User watch history
│   │   ├── HomePage.jsx          # Video feed with search and sorting
│   │   ├── LikedVideosPage.jsx   # Liked videos list
│   │   ├── LoginPage.jsx         # Sign in page
│   │   ├── PlaylistDetailPage.jsx# Playlist viewer and video manager
│   │   ├── PlaylistPage.jsx      # User playlists overview
│   │   ├── RegisterPage.jsx      # Account registration page
│   │   ├── SettingsPage.jsx      # User profile and security settings
│   │   ├── SubscriptionsPage.jsx # Subscriptions and subscribers tabs
│   │   ├── UploadPage.jsx        # Video upload with thumbnail preview
│   │   └── VideoPage.jsx         # Video player, comments, and engagement
│   ├── utils/
│   │   └── helpers.js      # Formatters (views, time ago, duration, error messages)
│   ├── App.jsx             # Route definitions and application shell
│   ├── index.css           # Global design tokens and base styles
│   └── main.jsx            # Application entry point
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- VideoTube Backend running locally (default: `http://localhost:8000` or `http://localhost:3000`)

### Installation

1. **Navigate to the Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `Frontend` directory (optional if using default proxy):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
   *(If omitted, it defaults to `http://localhost:8000/api/v1` via the Vite dev proxy or `http://localhost:3000/api/v1`)*.

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at:
   ```
   http://localhost:5173
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🔗 Connected Backend

This frontend communicates with the **VideoTube Express / Node.js & MongoDB** backend API, featuring:
- JWT Authentication (Access + Refresh Token cookies & headers)
- BullMQ + Redis async background video processing pipeline
- Cloudinary media asset management
- MongoDB Aggregation pipelines for statistics, watch history, and content queries
