# 🔧 SUPABASE SETUP INSTRUCTIONS

## Step 1: Run This SQL in Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy ALL the SQL from `supabase-setup.sql` file
5. Paste it into the SQL editor
6. Click "Run" button

This will:
- ✅ Create all 5 tables (users_profile, workouts, nutrition, water_logs, bmi_logs)
- ✅ Enable UUID extension
- ✅ Set up Row Level Security (RLS) policies
- ✅ Enable Realtime subscriptions
- ✅ Create indexes for performance

## Step 2: Disable Email Confirmation (For Testing)

1. In Supabase dashboard, click "Authentication" → "Providers"
2. Click on "Email"
3. DISABLE "Confirm email" toggle
4. Click "Save"

This allows instant signup without email verification.

## Step 3: Create Avatars Storage Bucket

1. Click "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Name it: `avatars`
4. Toggle "Public bucket" ON
5. Click "Create bucket"

## Step 4: Enable Realtime (Verify)

1. Go to "Database" → "Replication"  
2. Make sure these tables are checked:
   - users_profile
   - workouts
   - nutrition
   - water_logs
   - bmi_logs

If not checked, enable them.

## Step 5: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 6: Test the App

1. Open browser: http://localhost:5178 (or whatever port shows)
2. Click "Sign up"
3. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You should see: "Welcome to HealthHub 👋"
6. Dashboard loads with all features!

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Signup creates user → Dashboard shows
- [ ] Add workout → Toast appears → Dashboard updates
- [ ] Add nutrition → Toast appears → Dashboard updates
- [ ] Log water → Toast appears → Progress bar fills
- [ ] Calculate BMI → Shows on dashboard
- [ ] View Progress → Charts display
- [ ] Upload avatar → Image saves
- [ ] Toggle dark/light mode → Theme changes
- [ ] Logout → Returns to login page
- [ ] Login again → Data persists

---

## 🐛 Troubleshooting

### Error: "relation 'users_profile' does not exist"
→ Run the SQL from supabase-setup.sql

### Error: "Invalid API key"  
→ Check .env has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Error: "Email not confirmed"
→ Disable email confirmation in Authentication → Providers → Email

### Blank screen
→ Hard refresh browser (Ctrl+Shift+R)

### Charts not showing
→ Add some data first (workouts, nutrition, water)

---

## 📊 Database Schema Overview

After SQL runs, you'll have:

**users_profile** - User info (name, avatar, height, weight, login times)
**workouts** - Exercise tracking (exercise_name, duration, calories, date)
**nutrition** - Food tracking (food_name, calories, protein, fat, carbs)
**water_logs** - Hydration tracking (amount_ml, date)
**bmi_logs** - BMI history (height, weight, bmi, category)

All tables have:
- UUID primary keys
- user_id foreign key
- created_at timestamps
- RLS policies (users only see their own data)
- Realtime enabled

---

## 🎉 Success Indicators

When everything works, you'll see:
- ✅ No console errors
- ✅ Dashboard shows stats
- ✅ Data saves and persists
- ✅ Realtime updates without refresh
- ✅ Toast notifications for all actions
- ✅ Charts display with data

---

Ready to use HealthHub! 💪🏥
