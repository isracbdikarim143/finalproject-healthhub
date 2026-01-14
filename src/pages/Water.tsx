import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { WaterLog } from '../types';
import { toast } from '../components/Toast';
import { Droplet, Plus, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Water() {
  const { user } = useAuth();
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // LOADING STATE: Track form and quick-add submissions
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount_ml: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const quickAmounts = [250, 500, 750, 1000];

  useEffect(() => {
    if (user) {
      loadWaterLogs();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadWaterLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaterLogs(data || []);
    } catch (error) {
      console.error('Error loading water logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('water_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadWaterLogs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addWaterLog = async (amount: number, date: string) => {
    if (!user || submitting) return; // LOADING STATE: Prevent concurrent submissions

    setSubmitting(true); // LOADING STATE: Start
    try {
      const { error } = await supabase.from('water_logs').insert({
        user_id: user.id,
        amount_ml: amount,
        date: date,
      });

      if (error) throw error;
      toast.success('✅ Water intake saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log water intake');
    } finally {
      setSubmitting(false); // LOADING STATE: End
    }
  };

  const handleQuickAdd = async (amount: number) => {
    await addWaterLog(amount, format(new Date(), 'yyyy-MM-dd'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addWaterLog(parseInt(formData.amount_ml), formData.date);
    setShowForm(false);
    setFormData({
      amount_ml: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase.from('water_logs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Water log deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete log');
    }
  };

  const getTodayTotal = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return waterLogs
      .filter((log) => log.date === today)
      .reduce((sum, log) => sum + log.amount_ml, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading water logs...
          </p>
        </div>
      </div>
    );
  }

  const todayTotal = getTodayTotal();
  const goalAmount = 2000; // 2 liters goal
  const percentage = Math.min((todayTotal / goalAmount) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Water Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay hydrated throughout the day
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom
        </button>
      </div>

      {/* Today's Progress */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today's Progress
        </h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {todayTotal} ml
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Goal: {goalAmount} ml
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {percentage >= 100
              ? '🎉 Great job! You reached your daily goal!'
              : `${Math.round(percentage)}% of daily goal`}
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* LOADING STATE: Disable quick-add buttons during submission */}
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              disabled={submitting}
              className="p-4 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Droplet className="w-6 h-6 mx-auto mb-2" />
              {amount} ml
            </button>
          ))}
        </div>
      </div>

      {/* Custom Add Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add Custom Amount
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="label">
                  Amount (ml)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount_ml}
                  onChange={(e) =>
                    setFormData({ ...formData, amount_ml: e.target.value })
                  }
                  className="input"
                  placeholder="300"
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
              <button type="submit" className="btn-primary">
                Add Water Log
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Water Logs History */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          History
        </h3>
        {waterLogs.length === 0 ? (
          <div className="text-center py-8">
            <Droplet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No water logs yet. Start tracking your hydration!
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {waterLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Droplet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.amount_ml} ml
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(log.date), 'MMM dd, yyyy')}</span>
                      <span className="text-xs">
                        {format(new Date(log.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
