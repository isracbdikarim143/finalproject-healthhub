import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../Toast.jsx';
import { User, LogOut, Settings, Moon, Sun, ChevronDown } from 'lucide-react';

export function Header() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // UI FIX: Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // OPTIMIZATION: Enhanced logout flow with toast notification
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('✅ Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  // UI FIX: Extract first name from full name for cleaner display
  const firstName = profile?.name?.split(' ')[0] || 'User';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* UI FIX: Left - App branding (visible on mobile when sidebar is hidden) */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                HealthHub
              </h1>
            </div>
          </div>

          {/* UI FIX: Right - User info, theme toggle, and dropdown */}
          <div className="flex items-center gap-4 ml-auto">
            {/* UI FIX: Welcome message with username - Desktop */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Welcome, {firstName} 👋
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.email}
              </p>
            </div>

            {/* UI FIX: Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* UI FIX: User Avatar + Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {/* UI FIX: Avatar or default icon */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* UI FIX: Username on mobile (beside avatar) */}
                <span className="md:hidden text-sm font-medium text-gray-900 dark:text-white">
                  {firstName}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* UI FIX: Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {profile?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
