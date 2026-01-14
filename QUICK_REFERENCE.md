# HealthHub - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up Supabase & Run
1. Copy all SQL from `supabase-setup.sql`
2. Paste in Supabase SQL Editor → Run
3. Create `avatars` bucket in Storage (public)
4. Run: `npm run dev`

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `supabase-setup.sql` | Complete database setup |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `README.md` | Full documentation |
| `.env` | Add your Supabase credentials here |
| `src/App.tsx` | Main application |

---

## 🎯 Key Features

✅ **Authentication**: Signup, Login, Logout with welcome message
✅ **Dashboard**: Realtime daily stats (workouts, calories, water, nutrition, BMI)
✅ **Workouts**: Track exercises with success toasts
✅ **Nutrition**: 30+ foods including Somali dishes
✅ **Water**: Quick-add buttons + progress bar
✅ **Progress**: Charts with 7/14/30 day views
✅ **BMI**: Calculator with category and history
✅ **Profile**: Avatar upload + settings
✅ **Sidebar**: Collapsible navigation + session times
✅ **Theme**: Dark/Light mode toggle
✅ **Realtime**: Everything updates instantly
✅ **Responsive**: Mobile, Tablet, Desktop

---

## 🍛 Somali Foods Included

- Bariis (Rice)
- Baasto (Pasta)
- Canjeero (Somali Pancake)
- Hilib Ari (Goat Meat)
- Hilib Lo' (Beef)
- Caano (Milk)
- Cambuulo (Adzuki Beans)

---

## 🎨 Design Details

**Colors**: Green primary (#22c55e)
**Cards**: Rounded with soft shadows
**Sidebar**: Left-side navigation
**Responsive**: Collapses on mobile
**Theme**: Full dark/light mode support

---

## 🗄️ Database Tables

1. `users_profile` - User info & settings
2. `workouts` - Exercise tracking
3. `nutrition` - Food logs
4. `water_logs` - Hydration tracking
5. `bmi_logs` - BMI history

**All tables have**:
- ✅ Row Level Security (RLS)
- ✅ Realtime enabled
- ✅ User isolation
- ✅ Indexes for performance

---

## 📱 Test Checklist

- [ ] Sign up new account
- [ ] See welcome message
- [ ] Add workout → Check dashboard updates
- [ ] Add Somali food → Check dashboard updates
- [ ] Log water → Check progress bar
- [ ] Calculate BMI → Check dashboard shows it
- [ ] View charts in Progress
- [ ] Upload avatar in Profile
- [ ] Toggle dark/light mode
- [ ] Test on mobile (sidebar collapses)
- [ ] Sign out → Check logout time

---

## 🔒 Security Features

✅ Protected routes (auth required)
✅ RLS policies on all tables
✅ Users only see their own data
✅ Secure password handling
✅ Avatar upload secured

---

## 💻 Tech Stack

- React 19 + TypeScript
- Tailwind CSS 4.1
- Supabase 2.90
- Recharts 3.6
- Zustand 5.0
- React Router 7.12
- Lucide Icons
- Vite 7.2

---

## 📞 Troubleshooting

**"Invalid API Key"**
→ Check `.env` file has correct credentials

**"Permission Denied"**
→ Run `supabase-setup.sql` to create RLS policies

**"Realtime not working"**
→ Check Database → Replication in Supabase

**"Avatar upload fails"**
→ Create `avatars` bucket in Storage (make it public)

---

## 🎉 You're All Set!

Run `npm run dev` and visit `http://localhost:5173`

**Default Login**: Create account on first visit
**Welcome Message**: Appears after signup/login
**Dashboard**: Shows realtime stats
**All Features**: Working out of the box!

---

## 📚 Documentation

- 📖 **README.md** - Full documentation
- 🚀 **SETUP_GUIDE.md** - Step-by-step setup
- 📊 **PROJECT_SUMMARY.md** - Feature overview
- 📝 **FILES_CREATED.md** - Complete file list
- 🔧 **supabase-setup.sql** - Database setup

---

## ✨ Pro Tips

1. Use **Quick Add** buttons for water (250ml, 500ml, etc.)
2. Toggle **Dark Mode** from sidebar
3. Filter nutrition by **category** (especially "Somali")
4. View **7/14/30 day** charts in Progress
5. **BMI updates** dashboard automatically
6. Check **Session Info** in Profile
7. **Sidebar collapses** on mobile (click hamburger)

---

**Happy Health Tracking! 💪🏥**
