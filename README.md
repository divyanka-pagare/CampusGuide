# 🎓 CampusGuid – PVG College Campus Placement Experience Portal

A full-stack MERN application for sharing and discovering authentic campus placement & internship experiences at PVG College.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 Chatbot Experience Entry | Conversational bot guides students through sharing experience step-by-step |
| 🏢 Company-wise Posts | All experiences sorted by company name |
| ✅ Selected / ❌ Not Selected Split | Two-section view per company — learn what to do & avoid |
| 🔍 Filters | Filter by passing year, branch, drive type, result |
| 👍 Like / Dislike | Students can vote on helpfulness |
| 🛡️ Verified Badge | Admin / TPO / Principal can verify posts for credibility |
| ✏️ Edit / Delete | Only the post author can edit or delete their own post |
| 👑 Role-based Access | Student → TPO → Principal → Admin hierarchy |
| 🔒 PVG Email Auth | Only @pvgcoet.ac.in or @pvg.edu.in emails allowed |
| 📱 Responsive | Mobile-friendly across all pages |

---

## 🗂️ Project Structure

```
campusguid/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── companyController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Company.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── companyRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── chatbot/
    │   │   │   ├── Chatbot.jsx
    │   │   │   └── Chatbot.css
    │   │   ├── common/
    │   │   │   ├── PostCard.jsx
    │   │   │   └── PostCard.css
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Navbar.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx / Home.css
    │   │   ├── Companies.jsx
    │   │   ├── CompanyPage.jsx / CompanyPage.css
    │   │   ├── PostDetail.jsx / PostDetail.css
    │   │   ├── MyPosts.jsx
    │   │   ├── EditPost.jsx / EditPost.css
    │   │   ├── Admin.jsx / Admin.css
    │   │   ├── Profile.jsx
    │   │   └── Auth.jsx / Auth.css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campusguid
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Create Admin User

After starting the server, register with your PVG email, then manually update your role in MongoDB Atlas:
```
Database → campusguid → users → find your doc → set role: "admin"
```

### 4. Run Locally

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 🌐 Deployment

### Backend – Render.com (Free)

1. Create account at [render.com](https://render.com)
2. New → Web Service → Connect your GitHub repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables (all from .env)
7. Deploy!

### Frontend – Vercel (Free)

1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Root Directory: `frontend`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-render-backend-url.onrender.com/api`
5. Deploy!

### Database – MongoDB Atlas (Free)

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist `0.0.0.0/0` in Network Access (for Render)
4. Copy connection string to backend `.env`

---

## 🔑 API Endpoints

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with PVG email |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |

### Posts
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/posts` | Public | Get posts (with filters) |
| GET | `/api/posts/:id` | Public | Get single post |
| POST | `/api/posts` | Private | Create post |
| PUT | `/api/posts/:id` | Author only | Edit post |
| DELETE | `/api/posts/:id` | Author only | Delete post |
| POST | `/api/posts/:id/like` | Private | Toggle like |
| POST | `/api/posts/:id/dislike` | Private | Toggle dislike |
| GET | `/api/posts/my-posts` | Private | Get my posts |

### Companies
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/companies` | Public | All companies |
| GET | `/api/companies/:slug` | Public | Single company |

### Admin
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin/TPO/Principal | Dashboard stats |
| GET | `/api/admin/posts` | Admin/TPO/Principal | All posts |
| PATCH | `/api/admin/posts/:id/verify` | Admin/TPO/Principal | Verify post |
| DELETE | `/api/admin/posts/:id` | Admin only | Remove post |
| GET | `/api/admin/users` | Admin only | All users |
| PATCH | `/api/admin/users/:id/role` | Admin only | Change user role |

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Styling | Pure CSS with CSS Variables (no UI library) |
| Animations | CSS Animations |
| Toast Notifications | react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Security | Helmet, rate-limiting, mongo-sanitize, bcrypt |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 🔒 Security Features

- JWT tokens (7 day expiry)
- Password hashing with bcrypt (12 rounds)
- Rate limiting: 100 req/15min globally, 10 req/15min for auth
- MongoDB injection prevention (mongo-sanitize)
- HTTP security headers (Helmet)
- CORS configured for frontend domain only
- Email domain whitelist (PVG only)
- Role-based route protection

---

## 📋 Future Enhancements

- [ ] Email OTP verification for PVG emails
- [ ] Push notifications when posts are verified
- [ ] Comment system on posts
- [ ] Resume/resource sharing section
- [ ] Analytics dashboard (placement trends)
- [ ] Bookmark posts
- [ ] Search by keywords across all posts
- [ ] PWA support for offline access
- [ ] Dark/Light theme toggle

---

## 👨‍💻 Made for PVG College

Built with ❤️ to help PVG students ace their placements.
