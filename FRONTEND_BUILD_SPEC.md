# HowToob Frontend Build Specification

---

## 🚀 ULTIMATE START PROMPT (Copy this into Claude Code)

```
I need you to build the complete frontend for HowToob - an educational video platform. 
Read and follow FRONTEND_BUILD_SPEC.md exactly as written. This file contains our entire 
specification including design system, API endpoints, component requirements, and user flows.

PROJECT CONTEXT:
- Backend Flask API is running on http://localhost:5000 (already built, fully functional)
- We're building React + vanilla JS/HTML/CSS frontend (no external CSS frameworks)
- Design: Bold red (#E63946) accents on dark backgrounds (#1A1A1D, #2E2E31)
- Focus: Educational/tutorial platform for beginners - polished, NOT a YouTube clone
- Brand: HowToob with custom logo needed

START BY BUILDING PHASE 1 - FOUNDATION:

1. CREATE PROJECT STRUCTURE:
   - Set up proper folder organization (components/, pages/, context/, utils/, styles/, assets/)
   - Follow the exact file structure in the spec under "File Organization"

2. ESTABLISH DESIGN SYSTEM:
   - Create styles/variables.css with all CSS variables from the spec
   - Build styles/global.css with base styles (dark theme, typography, resets)
   - Use the exact color codes and spacing system specified

3. BUILD CORE LAYOUT COMPONENTS:
   - Navbar: Logo (left), search bar (center), user menu/login (right)
   - Sidebar: Collapsible navigation with Home, Trending, Subscriptions, Categories, etc.
   - Footer: Basic links and info
   - Make them responsive (mobile collapse, proper breakpoints)

4. IMPLEMENT AUTHENTICATION:
   - Create AuthContext for global auth state
   - Build Login page connecting to POST /auth/login
   - Build Register page connecting to POST /auth/register  
   - Add protected route wrapper for creator-only pages
   - Session-based auth using Flask-Login cookies

5. SET UP ROUTING:
   - Implement client-side routing (React Router or similar)
   - Create route structure: /, /login, /register, /watch/:id, /upload, /dashboard, /profile/:username, /search, /settings

DESIGN PRINCIPLES TO FOLLOW:
- Red is accent ONLY (borders, buttons, CTAs) - not overwhelming
- Dark backgrounds with excellent contrast for readability
- Beginner-friendly: clear labels, helpful tooltips, intuitive navigation
- Polished and professional - think Netflix content discovery + Udemy learning focus
- Custom branding - avoid anything that looks like YouTube

TECHNICAL REQUIREMENTS:
- All API calls use fetch() with proper error handling
- Loading states for async operations
- Form validation with helpful error messages
- Mobile-first responsive design
- Semantic HTML with accessibility in mind
- CSS modules or scoped styles per component

After Phase 1 is complete, we'll move to Phase 2 (video feed, watch page, social features), 
then Phase 3 (creator tools), Phase 4 (search/discovery), and Phase 5 (polish).

Show me the initial project structure first, then we'll build each component step-by-step 
following the spec. Reference specific sections of FRONTEND_BUILD_SPEC.md as you go.

Let's build this right - quality over speed.
```

---

## Project Overview
Build a complete, production-ready frontend for **HowToob** - an educational video platform focused on tutorials and how-to content. The platform emphasizes beginner-friendly learning with a bold, modern design that stands apart from YouTube.

## Design Identity

### Brand
- **Name**: HowToob
- **Tagline**: "Learn Anything, Share Everything" (suggested)
- **Mission**: Educational/tutorial-focused video platform for creators and learners
- **Logo**: Need to create a custom logo incorporating the name with red accent

### Visual Design System
- **Primary Colors**: 
  - Red: `#E63946` (bold, energetic - primary brand color)
  - Black: `#1A1A1D` (deep, sophisticated - backgrounds)
  - Dark Gray: `#2E2E31` (secondary backgrounds, cards)
  - White: `#F8F9FA` (text on dark, clean accents)
  - Light Gray: `#E5E5E5` (borders, dividers)

- **Accent Colors**:
  - Success Green: `#06D6A0` (upload success, positive actions)
  - Warning Orange: `#FF9F1C` (notifications, alerts)
  - Info Blue: `#2EC4B6` (informational elements)

- **Typography**:
  - **Headings**: Inter or Poppins (bold, modern, clean)
  - **Body**: Inter or Open Sans (readable, web-optimized)
  - **Monospace**: Fira Code or JetBrains Mono (code snippets in tutorials)

- **Design Principles**:
  - Bold but not aggressive - red as accent, not overwhelming
  - Dark theme with excellent contrast for readability
  - Beginner-friendly: clear labels, helpful tooltips, intuitive UI
  - Polished and professional, not playful or cartoon-like
  - Focus on content discovery and learning pathways

### UI Style References
- **NOT like**: YouTube's layout (avoid red top bar, standard grid)
- **Inspiration**: Mix of Netflix (content discovery) + Udemy (learning focus) + modern SaaS dashboards
- Unique card designs with red accent borders/highlights
- Custom video player controls with HowToob branding
- Educational focus in every design decision

## Technical Stack

### Frontend Technologies
- **React** (functional components, hooks)
- **JavaScript** (ES6+)
- **HTML5** (semantic markup)
- **CSS3** (modern features, CSS Grid, Flexbox)
- **No external CSS frameworks** - build custom, lightweight styles

### API Integration
- Backend running on `http://localhost:5000`
- RESTful JSON API
- Session-based authentication via Flask-Login
- Fetch API for all HTTP requests

## Backend API Endpoints Reference

### Authentication (`/auth`)
```
POST /auth/register
Body: { username, email, password, role: "viewer"|"creator"|"admin" }
Returns: { message, user: { id, username, email, role, created_at } }

POST /auth/login
Body: { email, password }
Returns: { message, user: { id, username, email, role } }

POST /auth/logout
Returns: { message }

GET /auth/me
Returns: { authenticated: true/false, user: {...} }
```

### Videos (`/videos`)
```
GET /videos/
Returns: [{ id, title, description, file_path, thumbnail_path, creator_id, views, created_at }]

GET /videos/feed?page=1&limit=10&search=query
Returns: { videos: [...], total, page, limit, total_pages }

GET /videos/<id>
Returns: { id, title, description, file_path, thumbnail_path, creator_id, creator_username, views, created_at }

POST /videos/upload (multipart/form-data, requires login)
Body: video (file), thumbnail (file), title, description
Returns: { id, title, ... }

PUT /videos/<id> (requires login, owner only)
Body: { title?, description?, thumbnail_path? }
Returns: updated video object

DELETE /videos/<id> (requires login, owner only)
Returns: { message: "Video deleted" }

GET /videos/creator/<user_id>
Returns: [videos by this creator]

GET /videos/files/videos/<filename>
Returns: video file stream

GET /videos/files/thumbnails/<filename>
Returns: thumbnail image
```

### Social Features (`/social`)
```
POST /social/videos/<video_id>/like (requires login)
Returns: { message, likes_count }

DELETE /social/videos/<video_id>/unlike (requires login)
Returns: { message, likes_count }

GET /social/videos/<video_id>/stats
Returns: { likes: number, comments: number, user_liked: bool }

POST /social/videos/<video_id>/comments (requires login)
Body: { content }
Returns: { id, content, user_id, username, video_id, created_at }

GET /social/videos/<video_id>/comments
Returns: [{ id, content, user_id, username, created_at }]

DELETE /social/comments/<comment_id> (requires login, owner only)
Returns: { message }

POST /social/users/<user_id>/subscribe (requires login)
Returns: { message, subscriber_count }

DELETE /social/users/<user_id>/unsubscribe (requires login)
Returns: { message, subscriber_count }

GET /social/users/<user_id>/subscribers
Returns: { count: number, is_subscribed: bool }
```

### User Profile (`/user`)
```
GET /user/profile/<user_id>
Returns: { id, username, email, role, created_at, video_count, subscriber_count }

PUT /user/profile (requires login)
Body: { username?, email? }
Returns: updated user object

GET /user/videos (requires login - own videos)
Returns: [user's uploaded videos]
```

## Application Structure

### Pages to Build

#### 1. Authentication Pages
- **Login Page** (`/login`)
  - Email + password form
  - "Remember me" checkbox
  - Link to register
  - Error handling with helpful messages
  - Redirect to home after successful login

- **Register Page** (`/register`)
  - Username, email, password, confirm password
  - Role selection: Viewer or Creator
  - Terms acceptance checkbox
  - Form validation (email format, password strength)
  - Redirect to login after successful registration

#### 2. Main Navigation Layout
- **Top Navbar**:
  - HowToob logo (left) - clickable to home
  - Search bar (center) - live search as you type
  - User menu (right): Profile pic/avatar, notifications bell, upload button (creators only)
  - Login/Register buttons (when logged out)

- **Left Sidebar**:
  - Home
  - Trending/Popular
  - Subscriptions (logged in users)
  - My Videos (creators only)
  - Watch History (logged in)
  - My Collections/Playlists
  - Categories dropdown:
    - Technology
    - Science
    - Arts & Crafts
    - Cooking
    - Fitness
    - Business
    - Language Learning
    - DIY & Home Improvement
  - Settings (logged in)

#### 3. Home/Feed Page (`/`)
- **Hero Section** (Featured Tutorial):
  - Large featured video card
  - Title, creator, view count
  - "Watch Now" CTA button
  - Rotation/carousel of 3-5 featured tutorials

- **Video Grid**:
  - Mixed layout: Featured + standard grid
  - Each card shows:
    - Thumbnail with play duration overlay
    - Title (truncated with ellipsis)
    - Creator name + avatar
    - View count + upload date
    - Category badge
  - Infinite scroll or pagination
  - Filter by: Recent, Popular, Trending
  - "Load More" button

- **Sidebar Widgets**:
  - Trending topics
  - Top creators this week
  - Your subscriptions (if logged in)

#### 4. Video Watch Page (`/watch/<video_id>`)
- **Video Player Section**:
  - Custom HTML5 video player with HowToob branding
  - Controls: play/pause, volume, playback speed, fullscreen
  - Red accent on progress bar
  - Auto-play next from same creator option

- **Video Info Section**:
  - Title (large, bold)
  - View count + upload date
  - Like/Dislike buttons with counts
  - Share button (copy link, social media)
  - Save to collection button

- **Creator Info**:
  - Avatar + username
  - Subscriber count
  - Subscribe button (if not subscribed, red accent)
  - "More from this creator" section

- **Description Section**:
  - Expandable/collapsible
  - Formatted text with links
  - Timestamps for video chapters (if provided)

- **Comments Section**:
  - Sort by: Top, Newest
  - Comment input (logged in users)
  - Display: Avatar, username, timestamp, content
  - Like comment button
  - Delete (own comments only)
  - Pagination or "Load more"

- **Related/Suggested Videos**:
  - Right sidebar or below comments
  - Similar category videos
  - Videos from same creator

#### 5. Upload Page (`/upload`) - Creators Only
- **Upload Form**:
  - Drag-and-drop video file area
  - File input with preview
  - Title input (required)
  - Description textarea (rich text editor optional)
  - Thumbnail upload (optional - generate from video if not provided)
  - Category selection (dropdown or tags)
  - Privacy settings: Public, Unlisted (future: Private, Scheduled)
  - "Upload Tutorial" button (red, prominent)

- **Upload Progress**:
  - Progress bar during upload
  - File size + estimated time
  - Cancel option
  - Success message with "View Video" link

#### 6. Creator Dashboard (`/dashboard`) - Creators Only
- **Overview Section**:
  - Total views (all videos)
  - Total subscribers
  - Total videos uploaded
  - Growth stats (optional: charts)

- **My Videos List**:
  - Table/grid view toggle
  - Each row: Thumbnail, Title, Views, Likes, Comments, Upload Date, Actions (Edit, Delete)
  - Sort by: Date, Views, Likes
  - Search within your videos

- **Analytics** (optional for MVP, can be placeholder):
  - Views over time
  - Top performing videos
  - Audience demographics

#### 7. User Profile Page (`/profile/<username>`)
- **Profile Header**:
  - Avatar (large)
  - Username
  - Join date
  - Subscriber count
  - Subscribe button (if viewing another user)

- **Tabs**:
  - **Videos**: Grid of uploaded videos
  - **Playlists**: User's public playlists/collections
  - **About**: Bio, links, description

- **Public Collections**:
  - Saved video playlists
  - Category-based collections

#### 8. My Collections/Playlists Page (`/collections`)
- **Collections List**:
  - Create new collection button
  - Grid/list of collections
  - Each shows: Name, video count, thumbnail (first video), privacy

- **Collection Detail View**:
  - Collection name + description
  - Video list (draggable to reorder)
  - Add/remove videos
  - Share collection option

#### 9. Search Results Page (`/search?q=query`)
- **Search Results**:
  - Filter tabs: All, Videos, Creators, Playlists
  - Video cards matching query
  - Creator profiles matching query
  - Sort by: Relevance, Recent, Most Viewed
  - No results state with suggestions

#### 10. Settings Page (`/settings`) - Logged In Users
- **Account Settings**:
  - Change username
  - Change email
  - Change password
  - Delete account (with confirmation)

- **Privacy Settings**:
  - Watch history on/off
  - Public/private profile
  - Subscription visibility

- **Notification Settings**:
  - Email notifications
  - New uploads from subscriptions
  - Comments on your videos

## Component Architecture

### Reusable Components to Build

1. **Navbar** (top navigation, fixed)
2. **Sidebar** (left navigation, collapsible on mobile)
3. **VideoCard** (thumbnail, title, creator, views - used everywhere)
4. **VideoPlayer** (custom HTML5 player with controls)
5. **CommentItem** (single comment display)
6. **CommentForm** (comment input with submit)
7. **Button** (primary red, secondary, ghost variants)
8. **Input** (text, email, password with validation states)
9. **Modal** (reusable for confirmations, forms)
10. **Dropdown** (category selector, user menu)
11. **Tooltip** (helpful hints for beginners)
12. **LoadingSpinner** (with HowToob branding)
13. **ErrorMessage** (consistent error display)
14. **SuccessMessage** (consistent success feedback)
15. **Avatar** (user profile picture with fallback)
16. **Badge** (category labels, notification counts)
17. **SearchBar** (with autocomplete suggestions)
18. **ProgressBar** (upload progress, video timeline)

### State Management
- Use React hooks (useState, useEffect, useContext)
- Context API for:
  - Auth state (current user, isAuthenticated)
  - Theme (if implementing light/dark toggle)
- Local state for form inputs, UI toggles
- Session storage for temporary data (search history)

### Routing
- Client-side routing with React Router or similar
- Protected routes (redirect to login if not authenticated)
- Role-based routing (creator-only pages)

## User Flows

### First-Time Visitor
1. Lands on home page
2. Sees featured tutorials + video grid
3. Can browse without account
4. Click video → watch page (no login needed)
5. To like/comment/subscribe → redirect to login
6. After login → redirect back to video

### Creator Workflow
1. Register as "Creator"
2. Login → dashboard
3. Click "Upload Tutorial"
4. Fill form, upload video + thumbnail
5. Submit → processing message → success
6. View video or return to dashboard
7. See video in "My Videos"
8. Track views/likes/comments

### Learner Workflow
1. Register as "Viewer" or browse without account
2. Search for topic (e.g., "Python basics")
3. Browse results, click video
4. Watch, like, comment
5. Subscribe to creator
6. Save video to "Watch Later" collection
7. Get notified of new uploads

## Technical Requirements

### Performance
- Lazy load images (thumbnails)
- Code splitting for routes
- Debounce search input
- Paginate long lists (feed, comments)
- Optimize video player (progressive loading)

### Responsive Design
- Mobile-first approach
- Breakpoints: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Collapsible sidebar on mobile
- Stack video player + info on mobile
- Touch-friendly buttons (min 44px tap target)

### Accessibility
- Semantic HTML (nav, main, section, article)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Alt text for images
- Skip to main content link
- Color contrast WCAG AA minimum

### Error Handling
- Network errors → friendly message with retry
- 404 → custom "Video not found" page
- 403 → "You don't have permission" message
- Form validation errors → inline, specific messages
- Session expiry → redirect to login with message

### Security
- Never store passwords in localStorage
- Use httpOnly cookies for session (Flask-Login handles this)
- Sanitize user input (XSS prevention)
- CSRF protection on forms
- Validate file uploads (type, size)

## File Organization

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ...
│   ├── video/
│   │   ├── VideoCard.jsx
│   │   ├── VideoPlayer.jsx
│   │   ├── VideoGrid.jsx
│   │   └── ...
│   ├── comments/
│   │   ├── CommentItem.jsx
│   │   ├── CommentForm.jsx
│   │   └── CommentList.jsx
│   └── ...
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Watch.jsx
│   ├── Upload.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Search.jsx
│   └── Settings.jsx
├── context/
│   └── AuthContext.jsx
├── utils/
│   ├── api.js (fetch wrappers)
│   ├── validators.js
│   └── helpers.js
├── styles/
│   ├── variables.css (colors, fonts, spacing)
│   ├── global.css
│   └── [component].module.css
├── assets/
│   ├── logo.svg
│   └── icons/
└── App.jsx
```

## Styling Guidelines

### CSS Variables
```css
:root {
  /* Colors */
  --color-primary: #E63946;
  --color-primary-dark: #C62E3A;
  --color-bg-dark: #1A1A1D;
  --color-bg-secondary: #2E2E31;
  --color-text-light: #F8F9FA;
  --color-text-muted: #A0A0A0;
  --color-border: #3A3A3D;
  --color-success: #06D6A0;
  --color-warning: #FF9F1C;
  --color-info: #2EC4B6;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Component Example Styles
```css
/* VideoCard Example */
.video-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform var(--transition-normal);
  cursor: pointer;
  border: 2px solid transparent;
}

.video-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.video-card__thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  background: var(--color-bg-dark);
}

.video-card__info {
  padding: var(--space-md);
}

.video-card__title {
  color: var(--color-text-light);
  font-weight: 600;
  margin-bottom: var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
```

## Logo Design Brief

Create a custom HowToob logo with these specs:
- **Text**: "HowToob" in bold, modern sans-serif
- **Icon**: Incorporate a play button or learning symbol (graduation cap, book, lightbulb)
- **Colors**: Primary red (#E63946) for icon/accent, white text on dark or vice versa
- **Style**: Clean, minimal, scalable (SVG format)
- **Variants**: Full logo (icon + text), icon only, text only
- **Sizes**: Navbar (40px height), favicon (32x32), large (for hero sections)

## Development Phases

### Phase 1: Foundation (Week 1)
- Set up React project structure
- Create design system (CSS variables, base components)
- Build Navbar + Sidebar layout
- Implement routing
- Create authentication pages (login/register)
- Connect to `/auth` endpoints
- Auth context + protected routes

### Phase 2: Core Features (Week 2)
- Home page with video grid
- VideoCard component
- Connect to `/videos/feed` endpoint
- Video watch page
- Video player implementation
- Like/comment functionality
- Connect to `/social` endpoints

### Phase 3: Creator Tools (Week 3)
- Upload page + form
- File upload to `/videos/upload`
- Creator dashboard
- My Videos management
- Edit/delete functionality

### Phase 4: Social & Discovery (Week 4)
- User profiles
- Subscriptions
- Collections/playlists
- Search functionality
- Category filtering
- Related videos

### Phase 5: Polish & QA (Week 5)
- Responsive design refinement
- Accessibility audit
- Performance optimization
- Error handling improvements
- User testing + bug fixes
- Documentation

## Success Metrics

### User Experience
- First-time visitors can find and watch a video in < 30 seconds
- Clear visual distinction from YouTube
- Beginner-friendly UI with helpful labels/tooltips
- Fast page loads (< 2s on decent connection)

### Technical
- No console errors
- All API endpoints properly connected
- Responsive on mobile, tablet, desktop
- Passes WCAG AA accessibility standards

### Design
- Consistent use of red/black color scheme
- Custom logo implemented throughout
- Polished, professional appearance
- Unique identity (not a YouTube clone)

## Important Notes

### What NOT to Do
- Don't copy YouTube's exact layout/design
- Don't use red excessively (accent only)
- Don't make UI overwhelming for beginners
- Don't ignore mobile responsiveness
- Don't skip error states
- Don't hardcode API URLs (use environment variables)

### What TO Emphasize
- Educational focus in design decisions
- Beginner-friendly labeling and tooltips
- Clear CTAs (calls to action)
- Smooth, intuitive navigation
- Fast, responsive interactions
- Custom branding throughout
- Helpful error messages
- Loading states with feedback

## Questions to Ask During Development

1. **Does this feature help learners find quality tutorials?**
2. **Is this UI element obvious to a beginner?**
3. **Does this look like a HowToob feature or a YouTube copy?**
4. **Is the red accent enhancing or overwhelming?**
5. **Would this work well on a phone?**
6. **Is this error message helpful or confusing?**

## Additional Features (Post-MVP)

- Video chapters/timestamps
- Playlists auto-play
- Download videos (creator permission)
- Subtitles/captions
- Multiple quality options
- Dark/light theme toggle
- Keyboard shortcuts
- Picture-in-picture mode
- Email notifications
- Creator analytics dashboard
- Monetization features
- Live streaming
- Community posts

---

## Final Checklist Before Launch

- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] All API endpoints are connected and working
- [ ] Authentication flow is smooth (login, logout, protected routes)
- [ ] Forms have proper validation and error messages
- [ ] Loading states exist for all async operations
- [ ] Error states handle network failures gracefully
- [ ] Custom logo is implemented
- [ ] Red/black color scheme is consistent
- [ ] No YouTube branding or obvious design copies
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: ARIA labels are present
- [ ] Comments can be posted and deleted
- [ ] Videos can be uploaded, edited, deleted
- [ ] Search functionality works
- [ ] Subscriptions work correctly
- [ ] Collections/playlists are functional
- [ ] Video player controls work (play, pause, volume, fullscreen)
- [ ] Like/unlike functionality works
- [ ] User profiles display correctly
- [ ] Code is organized and commented
- [ ] No console errors or warnings

---

**This document is the complete specification for building HowToob's frontend. Use it as your north star for all development decisions. When in doubt, refer back to the design principles and user flows outlined here.**
