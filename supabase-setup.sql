-- HealthHub Database Setup
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- ========================================
-- 1. ENABLE EXTENSIONS
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. CREATE TABLES
-- ========================================

-- Users Profile Table
CREATE TABLE users_profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  height NUMERIC,
  weight NUMERIC,
  last_login TIMESTAMPTZ,
  last_logout TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  calories_burned INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition Table
CREATE TABLE nutrition (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Logs Table
CREATE TABLE water_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BMI Logs Table
CREATE TABLE bmi_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. CREATE INDEXES
-- ========================================

CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_nutrition_user_date ON nutrition(user_id, date);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);
CREATE INDEX idx_bmi_logs_user ON bmi_logs(user_id, created_at DESC);

-- ========================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmi_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREATE RLS POLICIES
-- ========================================

-- Users Profile Policies
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- Workouts Policies
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Nutrition Policies
CREATE POLICY "Users can view own nutrition"
  ON nutrition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition"
  ON nutrition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition"
  ON nutrition FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition"
  ON nutrition FOR DELETE
  USING (auth.uid() = user_id);

-- Water Logs Policies
CREATE POLICY "Users can view own water logs"
  ON water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water logs"
  ON water_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
  ON water_logs FOR DELETE
  USING (auth.uid() = user_id);

-- BMI Logs Policies
CREATE POLICY "Users can view own BMI logs"
  ON bmi_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own BMI logs"
  ON bmi_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own BMI logs"
  ON bmi_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own BMI logs"
  ON bmi_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 6. ENABLE REALTIME
-- ========================================

ALTER PUBLICATION supabase_realtime ADD TABLE users_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE workouts;
ALTER PUBLICATION supabase_realtime ADD TABLE nutrition;
ALTER PUBLICATION supabase_realtime ADD TABLE water_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE bmi_logs;

-- ========================================
-- SETUP COMPLETE!
-- ========================================

-- Next steps:
-- 1. Create 'avatars' storage bucket (make it public)
-- 2. Add storage policies for avatars (see README.md)
-- 3. Verify all tables in Table Editor
-- 4. Check Database > Replication to confirm realtime is enabled
