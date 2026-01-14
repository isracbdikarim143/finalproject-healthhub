import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Dumbbell, Flame, Droplet, Apple, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { getBMICategoryColor } from '../utils/bmi';

export function Dashboard() {
  
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    totalWaterIntake: 0,
    totalNutritionCalories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Get today's workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select('calories_burned')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalWorkouts = workouts?.length || 0;
      const totalCaloriesBurned =
        workouts?.reduce((sum, w) => sum + w.calories_burned, 0) || 0;

      // Get today's water intake
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalWaterIntake =
        waterLogs?.reduce((sum, w) => sum + w.amount_ml, 0) || 0;

      // Get today's nutrition
      const { data: nutrition } = await supabase
        .from('nutrition')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalNutritionCalories =
        nutrition?.reduce((sum, n) => sum + n.calories, 0) || 0;

      // Get latest BMI
      const { data: bmiData } = await supabase
        .from('bmi_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalWorkouts,
        totalCaloriesBurned,
        totalWaterIntake,
        totalNutritionCalories,
        latestBMI,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to workouts changes
    const workoutsSubscription = supabase
      .channel('workouts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to water_logs changes
    const waterSubscription = supabase
      .channel('water_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to nutrition changes
    const nutritionSubscription = supabase
      .channel('nutrition_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nutrition',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to BMI changes
    const bmiSubscription = supabase
      .channel('bmi_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bmi_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      workoutsSubscription.unsubscribe();
      waterSubscription.unsubscribe();
      nutritionSubscription.unsubscribe();
      bmiSubscription.unsubscribe();
    };
  };

  
  if (loading || authLoading || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UI FIX: Personalized Welcome Banner with Username */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-primary-100">
              Here's your daily summary for {format(new Date(), 'MMMM dd, yyyy')}
            </p>
          </div>
          {profile?.avatar_url && (
            <div className="hidden md:block">
              <img
                src={profile.avatar_url}
                alt={profile.name || 'User'}
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Workouts Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workouts
            </h3>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalWorkouts}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completed today
          </p>
        </div>

        {/* Calories Burned Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calories Burned
            </h3>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalCaloriesBurned}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            kcal from workouts
          </p>
        </div>

        {/* Water Intake Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Water Intake
            </h3>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Droplet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalWaterIntake}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">ml consumed</p>
        </div>

        {/* Nutrition Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nutrition
            </h3>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Apple className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalNutritionCalories}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            kcal consumed
          </p>
        </div>

        {/* BMI Card */}
        <div className="card md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Body Mass Index (BMI)
            </h3>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {stats.latestBMI ? (
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.latestBMI.bmi}
                </p>
                <p
                  className={`text-xl font-semibold ${getBMICategoryColor(
                    stats.latestBMI.category
                  )}`}
                >
                  {stats.latestBMI.category}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Height: {stats.latestBMI.height}cm | Weight:{' '}
                {stats.latestBMI.weight}kg
              </p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No BMI data yet. Calculate your BMI to see it here!
            </p>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-full">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Keep Going! 💪</h3>
            <p className="text-primary-50">
              You're doing great! Stay consistent with your health goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
