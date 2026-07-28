# Novu-ai

Novu-ai is an AI agent and full-stack web application powered by the Groq API for advanced AI capabilities. It features a React-based frontend and an Express-based Node.js backend, incorporating modern web development practices including authentication, file processing, and responsive design.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router DOM
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Uploads:** Multer
- **Other Utilities:** Nodemailer, PDF Parse

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **MongoDB** (local instance or MongoDB Atlas cluster)

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Novu-ai
```

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add your environment variables:

```env
# MongoDB — use MongoDB Atlas free tier or local
MONGO_URI=mongodb://localhost:27017/novuai

# JWT secret
JWT_SECRET=your_jwt_secret

# Groq API key (get from https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key

# Port
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory and add your environment variables:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Supabase — get these from your project's Settings > API
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 💻 How to Run

You will need two terminal windows to run both the frontend and backend simultaneously.

**Running the Backend (Development Mode)**
```bash
cd backend
npm run dev
```
The backend server will typically start on `http://localhost:5000` (depending on your `.env`).

**Running the Frontend (Development Mode)**
```bash
cd frontend
npm run dev
```
Vite will start the frontend development server, usually on `http://localhost:5173`.

## 📂 Project Structure

```
Novu-ai/
├── backend/            # Express.js backend API
│   ├── src/            # Source code (Controllers, Models, Routes)
│   ├── package.json    # Backend dependencies
│   └── .env            # Backend environment variables
└── frontend/           # React + Vite frontend application
    ├── src/            # Source code (Components, Pages, Hooks)
    ├── package.json    # Frontend dependencies
    └── vite.config.ts  # Vite configuration
```
