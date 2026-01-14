import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Workout } from '../types';
import { toast } from '../components/Toast';
import { exerciseList } from '../utils/foodData';
import { Dumbbell, Plus, Calendar, Clock, Flame, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // LOADING STATE: Track form submission to disable button and prevent double-submit
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    exercise_name: '',
    duration: '',
    calories_burned: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (user) {
      loadWorkouts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('workouts_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadWorkouts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return; // LOADING STATE: Prevent double submission

    setSubmitting(true); // LOADING STATE: Start submission
    try {
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        exercise_name: formData.exercise_name,
        duration: parseInt(formData.duration),
        calories_burned: parseInt(formData.calories_burned),
        date: formData.date,
      });

      if (error) throw error;

      toast.success('✅ Workout completed successfully');
      setShowForm(false);
      setFormData({
        exercise_name: '',
        duration: '',
        calories_burned: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add workout');
    } finally {
      setSubmitting(false); // LOADING STATE: End submission
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Workout deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete workout');
    }
  };

  // LOADING STATE: Show skeleton cards while loading for better perceived performance
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workouts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your exercises and calories burned
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Workout
        </button>
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add New Workout
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="exercise" className="label">
                  Exercise
                </label>
                <select
                  id="exercise"
                  value={formData.exercise_name}
                  onChange={(e) =>
                    setFormData({ ...formData, exercise_name: e.target.value })
                  }
                  className="input"
                  required
                >
                  <option value="">Select exercise</option>
                  {exerciseList.map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="label">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="input"
                  placeholder="30"
                  required
                />
              </div>

              <div>
                <label htmlFor="calories" className="label">
                  Calories Burned
                </label>
                <input
                  id="calories"
                  type="number"
                  min="1"
                  value={formData.calories_burned}
                  onChange={(e) =>
                    setFormData({ ...formData, calories_burned: e.target.value })
                  }
                  className="input"
                  placeholder="250"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="label">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              {/* LOADING STATE: Disable button and show loading text during submission */}
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : 'Save Workout'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workouts List */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <div className="card text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No workouts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your exercises to see them here
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="card relative group">
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {workout.exercise_name}
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{workout.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Flame className="w-4 h-4" />
                    <span>{workout.calories_burned} kcal</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(workout.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
