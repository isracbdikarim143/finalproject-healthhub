import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Nutrition as NutritionType } from '../types';
import { toast } from '../components/Toast';
import { foodDatabase } from '../utils/foodData';
import { Apple, Plus, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Nutrition() {
  const { user } = useAuth();
  const [nutritionLogs, setNutritionLogs] = useState<NutritionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState('');
  // LOADING STATE: Track submission state
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (user) {
      loadNutrition();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadNutrition = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrition')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionLogs(data || []);
    } catch (error) {
      console.error('Error loading nutrition:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('nutrition_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nutrition',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNutrition();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFood || submitting) return; // LOADING STATE: Prevent double submit

    const food = foodDatabase.find((f) => f.name === selectedFood);
    if (!food) return;

    setSubmitting(true); // LOADING STATE: Start
    try {
      const { error } = await supabase.from('nutrition').insert({
        user_id: user.id,
        food_name: food.name,
        category: food.category,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        date: formData.date,
      });

      if (error) throw error;

      toast.success('✅ Nutrition added successfully');
      setShowForm(false);
      setSelectedFood('');
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add nutrition');
    } finally {
      setSubmitting(false); // LOADING STATE: End
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase.from('nutrition').delete().eq('id', id);
      if (error) throw error;
      toast.success('Nutrition entry deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  const categories = ['All', ...new Set(foodDatabase.map((f) => f.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFoods =
    selectedCategory === 'All'
      ? foodDatabase
      : foodDatabase.filter((f) => f.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading nutrition data...
          </p>
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
            Nutrition
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your meals and daily nutrition intake
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Meal
        </button>
      </div>

      {/* Add Nutrition Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add Meal
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="label">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Food Selection */}
              <div>
                <label htmlFor="food" className="label">
                  Select Food
                </label>
                <select
                  id="food"
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Choose a food</option>
                  {filteredFoods.map((food) => (
                    <option key={food.name} value={food.name}>
                      {food.name} ({food.calories} kcal)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
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

            {/* Food Details Preview */}
            {selectedFood && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {(() => {
                  const food = foodDatabase.find((f) => f.name === selectedFood);
                  if (!food) return null;
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Calories
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {food.calories} kcal
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Protein
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {food.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Fat
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {food.fat}g
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Carbs
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {food.carbs}g
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-3">
              {/* LOADING STATE: Disable during submission */}
              <button type="submit" disabled={submitting || !selectedFood} className="btn-primary">
                {submitting ? 'Adding...' : 'Add Meal'}
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

      {/* Nutrition Logs */}
      <div className="space-y-4">
        {nutritionLogs.length === 0 ? (
          <div className="card text-center py-12">
            <Apple className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No meals logged yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your nutrition to see it here
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Meal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nutritionLogs.map((log) => (
              <div key={log.id} className="card relative group">
                <button
                  onClick={() => handleDelete(log.id)}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Apple className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {log.food_name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {log.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Calories</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.calories} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Protein</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.protein}g
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Fat</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.fat}g
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Carbs</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.carbs}g
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(log.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
