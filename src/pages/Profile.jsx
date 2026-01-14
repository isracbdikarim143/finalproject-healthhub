import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from '../components/Toast.jsx';
import { User, Camera, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    try {
      setUploadingAvatar(true);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      
      // AVATAR FIX: Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      // AVATAR FIX: Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      // AVATAR FIX: Use user_id subfolder structure: avatars/{user_id}/{filename}
      const filePath = `${user?.id}/${fileName}`;

      // AVATAR FIX: Delete old avatar if exists (cleanup)
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/avatars/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // AVATAR FIX: Upload to Supabase Storage with proper content type
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true, // Allow overwriting
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload avatar. Please check storage permissions.');
      }

      // AVATAR FIX: Get public URL with proper path
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // AVATAR FIX: Save URL to database immediately
      const newAvatarUrl = data.publicUrl;
      await updateProfile({ avatar_url: newAvatarUrl });

      setAvatarUrl(newAvatarUrl);
      toast.success('✅ Avatar uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Error uploading avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name,
        avatar_url: avatarUrl,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="card lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Picture
          </h3>

          <div className="flex flex-col items-center">
            {/* Avatar Display */}
            <div className="relative mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 border-4 border-primary-200 dark:border-primary-800 flex items-center justify-center">
                  {profile?.name ? (
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {getInitials(profile.name)}
                    </span>
                  ) : (
                    <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
              )}

              {/* Upload Button Overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full cursor-pointer transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingAvatar && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploading...
              </p>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Click the camera icon to upload a new photo
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Session Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Session Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Last Login
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile?.last_login
                  ? format(new Date(profile.last_login), 'PPpp')
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Last Logout
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile?.last_logout
                  ? format(new Date(profile.last_logout), 'PPpp')
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Account Created
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile?.created_at
                  ? format(new Date(profile.created_at), 'PP')
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                User ID
              </p>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                {user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Keep Up the Great Work! 💪
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          You're making great progress on your health journey. Stay consistent with
          your workouts, nutrition, and hydration goals!
        </p>
      </div>
    </div>
  );
}
