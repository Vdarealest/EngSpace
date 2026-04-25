# 📚 EngSpace - Learning Management System

An online English learning platform with clear learning paths, real-world lessons, and easy-to-track self-study spaces.

🌐 **Live Demo**
* **Frontend:** [https://eng-space.vercel.app](https://eng-space.vercel.app)
* **Backend API:** [https://engspace.onrender.com](https://engspace.onrender.com)
* **API Documentation:** [https://engspace.onrender.com/api-docs](https://engspace.onrender.com/api-docs)

---

## ✨ Key Features

### 👨‍🎓 For Learners
* **Course Management:** Browse and enroll in various English courses.
* **Progress Tracking:** Track learning progress visually.
* **Interactive Quizzes:** Complete quizzes to test knowledge.
* **Secure Payments:** Integrated with **VNPay** for safe transactions.
* **Educational Blog:** Read latest articles and tips for learning English.

### 👨‍💼 For Instructors & Admins
* **Course Creation:** Advanced tools to manage course content.
* **Analytics Dashboard:** View student enrollments and performance.
* **Revenue Monitoring:** Real-time tracking of course sales.
* **Media Management:** Upload images and materials via Multer.

---

## 🏗️ Tech Stack

### Frontend
* **React 19.2.0** - UI Framework
* **Vite 7.2.2** - Build Tool
* **React Router 7.9.5** - Navigation
* **Bootstrap 5.3.8** - Styling
* **Recharts 3.5.1** - Data Visualization
* **Axios 1.13.2** - HTTP Client
* **Google OAuth** - Authentication

### Backend
* **Node.js & Express.js** - Runtime & Framework
* **MongoDB** - NoSQL Database
* **JWT** - Token Authentication
* **Multer** - File Upload
* **VNPay API** - Payment Gateway
* **Nodemailer** - Email Service

---

## 📁 Project Structure

```text
EngSpace/
├── frontend/                # React + Vite App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth & State Context
│   │   └── api.js           # Axios configuration
│   └── package.json
├── backend/                 # Express Server
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   └── index.js         # Entry point
│   └── package.json
└── README.md

Quick Start
1. Clone Repository
Bash
git clone [https://github.com/Vdarealest/EngSpace.git](https://github.com/Vdarealest/EngSpace.git)
cd EngSpace
2. Setup Backend
Bash
cd backend
npm install
# Create .env and fill in: MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_SECRET
npm start
3. Setup Frontend
Bash
cd frontend
npm install
npm run dev
🛠 Troubleshooting
CORS Error: Check VITE_API_URL in .env and ensure the Vercel domain is whitelisted in the Backend CORS configuration.

Google Login: Ensure the Vercel URL is added to Authorized JavaScript origins in Google Cloud Console.

Render Cold Start: The backend may take 30-50s to "wake up" on the first request due to Render's free tier policy.

🎯 Roadmap
[ ] Mobile app (React Native)

[ ] AI-powered English speaking score (Gemini API)

[ ] Live class feature with Socket.io

[ ] Automated certificate generation
