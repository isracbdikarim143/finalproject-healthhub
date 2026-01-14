# 🏥 HealthHub - Health & Fitness Tracker

A modern, full-stack health and fitness tracking application built with React, TypeScript, and Supabase.

![HealthHub](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## ✨ Features

### 🔐 Authentication
- Secure signup/login with Supabase Auth
- Protected routes with auto-redirect
- Session persistence
- Email validation and error handling

### 📊 Dashboard
- Real-time stats overview
- Personalized welcome banner
- BMI calculator with category display
- Daily summary of workouts, nutrition, and water intake

### 💪 Workouts
- Log exercise sessions
- Track duration and calories burned
- Real-time updates
- Exercise history

### 🍎 Nutrition
- Food logging with Somali cuisine included
- Calorie and macros tracking (protein, carbs, fat)
- Meal categorization
- Daily nutrition summary

### 💧 Water Tracking
- Quick-add water intake (250ml, 500ml, 750ml, 1L)
- Custom amount entry
- Daily water goal tracking
- Hydration history

### 📈 Progress
- Interactive charts with Recharts
- Weight trends over time
- BMI history visualization
- Workout performance tracking

### 🔢 BMI Calculator
- Quick BMI input in sidebar
- Height (cm) and Weight (kg)
- Automatic category determination:
  - Underweight (< 18.5)
  - Normal (18.5-24.9)
  - Overweight (25-29.9)
  - Obese (≥ 30)
- Color-coded results
- BMI history

### 👤 Profile
- Avatar upload with RLS
- User information management
- Last login tracking
- Profile customization

### 🌓 Theme
- Dark/Light mode toggle
- Persistent theme preference
- Smooth transitions
- Accessible color schemes

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 3.4** - Styling
- **React Router 7** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Zustand** - Toast state management
- **date-fns** - Date utilities

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for avatars
  - Row Level Security (RLS)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/isracbdikarim143/finalproject-full.git
   cd finalproject-full
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase database:**
   
   Run the SQL script in your Supabase SQL Editor:
   - Open `supabase-setup.sql`
   - Copy all content
   - Paste in Supabase SQL Editor
   - Execute

5. **Configure Supabase Storage:**
   
   Create `avatars` bucket:
   - Go to Storage in Supabase
   - Create bucket named `avatars`
   - Make it public
   - Run storage policies from `AVATAR_STORAGE_SETUP.md`

6. **Disable email confirmation (optional for development):**
   
   In Supabase Dashboard:
   - Go to Authentication → Settings
   - Disable "Enable email confirmations"

7. **Start development server:**
   ```bash
   npm run dev
   ```

8. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub** (if not already done)

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Add Environment Variables:**
   - In Vercel project settings
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

## 📂 Project Structure

```
finalprojectt/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Signup, ProtectedRoute
│   │   ├── layout/         # Sidebar, Header, MainLayout
│   │   ├── ErrorBoundary.tsx
│   │   └── Toast.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Workouts.tsx
│   │   ├── Nutrition.tsx
│   │   ├── Water.tsx
│   │   ├── Progress.tsx
│   │   ├── BMICalculator.tsx
│   │   ├── Profile.tsx
│   │   └── Auth.tsx
│   ├── utils/
│   │   ├── bmi.ts          # BMI calculations
│   │   └── foodData.ts     # Food database
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── supabase-setup.sql      # Database schema
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all protected routes
- Secure session management
- Environment variables for sensitive data
- Avatar upload restricted to user's own files

## 🎨 Features Highlights

### Real-time Updates
- Dashboard stats update instantly
- No manual refresh needed
- Supabase Realtime subscriptions

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interfaces

### Loading States
- Skeleton loaders during data fetch
- No blank white screens
- Disabled buttons during API calls

### Error Handling
- Error Boundary for crash prevention
- Friendly error messages
- Toast notifications for feedback

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Isra Abdikarim**
- GitHub: [@isracbdikarim143](https://github.com/isracbdikarim143)

## 🙏 Acknowledgments

- Built with React and TypeScript
- Powered by Supabase
- Styled with Tailwind CSS
- Icons by Lucide

---

**Stay consistent, stay healthy! 💪🏥**
