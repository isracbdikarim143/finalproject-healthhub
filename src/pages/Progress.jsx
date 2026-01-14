import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';


export function Progress() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, days]);

  const loadProgressData = async () => {
    if (!user) return;

    setLoading(true);
    const dailyData = [];

    try {
      // Generate dates for the last N days
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');

        // Get workouts for this date
        const { data: workouts } = await supabase
          .from('workouts')
          .select('calories_burned')
          .eq('user_id', user.id)
          .eq('date', date);

        const workoutsCount = workouts?.length || 0;
        const caloriesBurned =
          workouts?.reduce((sum, w) => sum + w.calories_burned, 0) || 0;

        // Get nutrition for this date
        const { data: nutrition } = await supabase
          .from('nutrition')
          .select('calories')
          .eq('user_id', user.id)
          .eq('date', date);

        const nutritionCalories =
          nutrition?.reduce((sum, n) => sum + n.calories, 0) || 0;

        // Get water intake for this date
        const { data: water } = await supabase
          .from('water_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .eq('date', date);

        const waterIntake = water?.reduce((sum, w) => sum + w.amount_ml, 0) || 0;

        dailyData.push({
          date: format(new Date(date), 'MMM dd'),
          workouts,
          caloriesBurned,
          nutritionCalories,
          waterIntake,
        });
      }

      setData(dailyData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartColors = {
    primary: theme === 'dark' ? '#4ade80' : '#16a34a',
    secondary: theme === 'dark' ? '#60a5fa' : '#2563eb',
    tertiary: theme === 'dark' ? '#f59e0b' : '#d97706',
    quaternary: theme === 'dark' ? '#06b6d4' : '#0891b2',
  };

  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading progress data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your health journey over time
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Workouts Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily Workouts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Number of workouts completed each day
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="workouts" fill={chartColors.secondary} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calories Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Calories Burned vs Consumed
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily calorie balance
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="caloriesBurned"
              stroke={chartColors.tertiary}
              strokeWidth={2}
              name="Burned"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="nutritionCalories"
              stroke={chartColors.primary}
              strokeWidth={2}
              name="Consumed"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Water Intake Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily Water Intake
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Water consumed in milliliters
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="waterIntake"
              fill={chartColors.quaternary}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
