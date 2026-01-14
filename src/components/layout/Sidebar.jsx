import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from '../Toast.jsx';
import { calculateBMI, getBMICategory } from '../../utils/bmi';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Droplet,
  TrendingUp,
  User,
  Menu,
  X,
  Clock,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell },
  { name: 'Nutrition', href: '/nutrition', icon: Apple },
  { name: 'Water', href: '/water', icon: Droplet },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [savingBMI, setSavingBMI] = useState(false);

  // FIX: Add handleSaveBMI function that was missing
  const handleSaveBMI = async () => {
    if (!user) return;

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    // Validation
    if (!height || !weight) {
      toast.error('⚠️ Please enter both height and weight');
      return;
    }

    if (heightNum < 50 || heightNum > 300) {
      toast.error('⚠️ Height must be between 50-300 cm');
      return;
    }

    if (weightNum < 20 || weightNum > 500) {
      toast.error('⚠️ Weight must be between 20-500 kg');
      return;
    }

    setSavingBMI(true);

    try {
      // Calculate BMI
      const bmi = calculateBMI(heightNum, weightNum);
      const category = getBMICategory(bmi);

      // Save to database
      const { error } = await supabase.from('bmi_logs').insert({
        user_id: user.id,
        height: heightNum,
        weight: weightNum,
        bmi,
        category,
      });

      if (error) throw error;

      toast.success('✅ BMI calculated successfully');
      
      // Clear inputs
      setHeight('');
      setWeight('');
      
      // Close sidebar on mobile
      setIsOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save BMI');
    } finally {
      setSavingBMI(false);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              HealthHub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Stay consistent, stay healthy
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* BMI SIDEBAR: Quick BMI Calculator */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Quick BMI
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="50"
                  max="300"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="20"
                  max="500"
                />
              </div>
              
              <button
                onClick={handleSaveBMI}
                disabled={savingBMI}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {savingBMI ? 'Saving...' : 'Save BMI'}
              </button>
            </div>
          </div>

          {/* Session Info */}
          {profile?.last_login && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3" />
                <span>
                  Login: {format(new Date(profile.last_login), 'MMM dd, HH:mm')}
                </span>
              </div>
              {profile.last_logout && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last Logout:{' '}
                    {format(new Date(profile.last_logout), 'MMM dd, HH:mm')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* OPTIMIZATION: Removed Logout & Theme Toggle - Now in top Header */}
        </div>
      </aside>
    </>
  );
}
