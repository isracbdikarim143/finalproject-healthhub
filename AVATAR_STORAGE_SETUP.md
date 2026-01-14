# 🔧 AVATAR STORAGE SETUP (REQUIRED FOR AVATAR UPLOAD)

## ⚠️ YOU MUST RUN THIS IN SUPABASE DASHBOARD

Avatar upload will FAIL with RLS (Row Level Security) error until you complete these steps.

---

## STEP 1: Create Avatars Storage Bucket

1. Go to your Supabase project dashboard
2. Click **"Storage"** in the left sidebar
3. Click **"Create a new bucket"**
4. Fill in:
   - **Name**: `avatars`
   - **Public bucket**: Toggle **ON** ✅
5. Click **"Create bucket"**

---

## STEP 2: Add Storage Policies (RUN THIS SQL)

1. Go to **"SQL Editor"** in Supabase dashboard
2. Click **"New query"**
3. **Copy and paste ALL of this SQL** below:
4. Click **"Run"**

```sql
-- ========================================
-- AVATAR STORAGE POLICIES
-- ========================================

-- POLICY 1: Allow authenticated users to UPLOAD their own avatars
-- Path structure: avatars/{user_id}/{filename}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLICY 2: Allow authenticated users to UPDATE their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLICY 3: Allow authenticated users to DELETE their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLICY 4: Allow PUBLIC READ access to all avatars
-- This allows avatar images to be displayed
CREATE POLICY "Public can view all avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## STEP 3: Verify Setup

After running the SQL:

1. Go to **Storage** → **avatars** bucket
2. Click **"Policies"** tab
3. You should see **4 policies**:
   - ✅ Users can upload their own avatar
   - ✅ Users can update their own avatar
   - ✅ Users can delete their own avatar
   - ✅ Public can view all avatars

---

## STEP 4: Test Avatar Upload

1. Restart your dev server: `npm run dev`
2. Open app in browser
3. Go to **Profile** page
4. Click camera icon
5. Upload an image
6. Should see: **"✅ Avatar uploaded successfully"**
7. Avatar displays immediately

---

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
→ Run the SQL policies above in Supabase SQL Editor

### Error: "Bucket not found"
→ Create the `avatars` bucket in Storage (Step 1)

### Error: "File too large"
→ File must be under 2MB

### Avatar doesn't display
→ Make sure bucket is set to **Public**

### Error: "Failed to upload avatar"
→ Check that policies are applied correctly

---

## ✅ Success Indicators

When everything works:
- ✅ No RLS errors in console
- ✅ Avatar uploads successfully
- ✅ Toast shows "✅ Avatar uploaded successfully"
- ✅ Avatar displays immediately
- ✅ Avatar persists after refresh
- ✅ Old avatar is replaced when uploading new one

---

**After completing these steps, avatar upload will work perfectly!** 📸
