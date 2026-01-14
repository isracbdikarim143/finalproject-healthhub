# HealthHub Setup Guide

Follow these steps to get HealthHub running on your machine.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: HealthHub (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy these two values:
   - **Project URL** (under Project URL)
   - **anon public** key (under Project API keys)

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
# Windows
type nul > .env

# Mac/Linux
touch .env
```

2. Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Set Up Database

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy ALL the SQL from the README.md (section: SUPABASE SQL TABLES & RLS POLICIES)
4. Paste and click "Run"
5. Verify all tables were created:
   - Go to "Table Editor"
   - You should see: users_profile, workouts, nutrition, water_logs, bmi_logs

## Step 6: Set Up Storage for Avatars

1. In Supabase dashboard, click "Storage" (left sidebar)
2. Click "Create a new bucket"
3. Name it `avatars`
4. Make it **Public**
5. Click "Create bucket"
6. Click on the `avatars` bucket
7. Click "Policies" tab
8. Add the storage policies from README.md

## Step 7: Enable Realtime

1. Go to "Database" → "Replication"
2. Make sure these tables are enabled:
   - users_profile
   - workouts
   - nutrition
   - water_logs
   - bmi_logs

## Step 8: Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 9: Test the Application

1. Click "Sign up"
2. Create an account with:
   - Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
3. You should see: "Welcome to HealthHub 👋 Stay consistent, stay healthy."
4. You're now on the Dashboard!

## Troubleshooting

### Issue: "Invalid API Key"
- Double-check your `.env` file
- Make sure there are no extra spaces
- Restart the dev server after changing `.env`

### Issue: "Permission Denied" when adding data
- Make sure RLS policies are set up correctly
- Check that you're logged in
- Verify user_id is being passed correctly

### Issue: Realtime not working
- Check "Database" → "Replication" in Supabase
- Make sure tables are added to replication
- Restart dev server

### Issue: Avatar upload fails
- Verify `avatars` bucket exists and is public
- Check storage policies are set up
- Make sure image file size is under 5MB

## Features to Test

✅ **Authentication**
- Sign up
- Sign in
- Sign out

✅ **Dashboard**
- View today's stats
- Check BMI status

✅ **Workouts**
- Add a workout
- See it appear instantly on dashboard
- Delete a workout

✅ **Nutrition**
- Try Somali foods (Bariis, Canjeero, etc.)
- Filter by category
- View macros

✅ **Water**
- Use quick-add buttons
- Watch progress bar fill up
- Custom amount

✅ **Progress**
- View charts
- Change time range (7/14/30 days)

✅ **BMI Calculator**
- Calculate BMI
- View category
- Check history

✅ **Profile**
- Upload avatar
- Change name
- View session times

✅ **Theme**
- Toggle dark/light mode
- Check all pages update

✅ **Mobile**
- Collapse sidebar
- Responsive layout
- Touch-friendly

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify `.env` values are correct
3. Make sure all SQL commands ran successfully
4. Check Supabase logs (Settings → Logs)

## Next Steps

Once everything works:
1. Customize colors in `tailwind.config.js`
2. Add more exercises to `src/utils/foodData.ts`
3. Add more foods to the database
4. Deploy to Vercel/Netlify

Enjoy using HealthHub! 💪🏥
