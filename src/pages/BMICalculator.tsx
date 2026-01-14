import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { BMILog } from '../types';
import { toast } from '../components/Toast';
import { calculateBMI, getBMICategory, getBMICategoryColor } from '../utils/bmi';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function BMICalculator() {
  const { user } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiHistory, setBmiHistory] = useState<BMILog[]>([]);
  const [loading, setLoading] = useState(true);
  // BMI FIX: Add calculating state for better UX
  const [calculating, setCalculating] = useState(false);
  const [currentBMI, setCurrentBMI] = useState<{
    value: number;
    category: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadBMIHistory();
    }
  }, [user]);

  const loadBMIHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bmi_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBmiHistory(data || []);
    } catch (error) {
      console.error('Error loading BMI history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || calculating) return; // BMI FIX: Prevent double submission

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    // BMI FIX: Validate input values (cm and kg must be positive)
    if (heightNum <= 0 || weightNum <= 0) {
      toast.error('Please enter valid height (cm) and weight (kg)');
      return;
    }

    // BMI FIX: Reasonable range validation
    if (heightNum < 50 || heightNum > 300) {
      toast.error('Height must be between 50 and 300 cm');
      return;
    }

    if (weightNum < 20 || weightNum > 500) {
      toast.error('Weight must be between 20 and 500 kg');
      return;
    }

    setCalculating(true); // BMI FIX: Start calculating state

    // BMI FIX: Calculate using cm and kg (formula: weight / (height/100)²)
    const bmi = calculateBMI(heightNum, weightNum);
    const category = getBMICategory(bmi);

    setCurrentBMI({ value: bmi, category });

    try {
      // BMI FIX: Save to bmi_logs table for dashboard realtime update
      const { error } = await supabase.from('bmi_logs').insert({
        user_id: user.id,
        height: heightNum,
        weight: weightNum,
        bmi,
        category,
      });

      if (error) throw error;

      // BMI FIX: Show success toast with emoji as required
      toast.success('✅ BMI calculated successfully');
      loadBMIHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save BMI');
    } finally {
      setCalculating(false); // BMI FIX: End calculating state
    }
  };

  const getBMIInfo = (category: string) => {
    switch (category) {
      case 'Underweight':
        return {
          description: 'Your BMI is below the healthy range.',
          recommendation:
            'Consider consulting with a healthcare provider about healthy weight gain strategies.',
          range: '< 18.5',
        };
      case 'Normal':
        return {
          description: 'Your BMI is within the healthy range.',
          recommendation:
            'Maintain your current lifestyle with regular exercise and balanced nutrition.',
          range: '18.5 - 24.9',
        };
      case 'Overweight':
        return {
          description: 'Your BMI is above the healthy range.',
          recommendation:
            'Consider incorporating more physical activity and maintaining a balanced diet.',
          range: '25 - 29.9',
        };
      case 'Obese':
        return {
          description: 'Your BMI indicates obesity.',
          recommendation:
            'Consult with a healthcare provider for personalized guidance on weight management.',
          range: '≥ 30',
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading BMI data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          BMI Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calculate and track your Body Mass Index
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UI FIX: Enhanced BMI Calculator Input Section */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-lg shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Calculate Your BMI
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Enter your height and weight below
              </p>
            </div>
          </div>

          {/* UI FIX: Clear instruction banner */}
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              📏 <strong>Height in Centimeters (cm)</strong> • ⚖️ <strong>Weight in Kilograms (kg)</strong>
            </p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            {/* UI FIX: Enhanced Height Input */}
            <div>
              <label htmlFor="height" className="label text-base font-semibold">
                📏 Height (cm)
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                min="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input text-lg font-medium"
                placeholder="e.g., 170"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your height in centimeters (50-300 cm)
              </p>
            </div>

            {/* UI FIX: Enhanced Weight Input */}
            <div>
              <label htmlFor="weight" className="label text-base font-semibold">
                ⚖️ Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input text-lg font-medium"
                placeholder="e.g., 70"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your weight in kilograms (20-500 kg)
              </p>
            </div>

            {/* UI FIX: Prominent Calculate Button */}
            <button 
              type="submit" 
              disabled={calculating} 
              className="btn-primary w-full text-lg py-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              {calculating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating...
                </span>
              ) : (
                '🔢 Calculate My BMI'
              )}
            </button>
          </form>

          {/* Current BMI Result */}
          {currentBMI && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your BMI
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentBMI.value}
                </p>
                <p
                  className={`text-xl font-semibold ${getBMICategoryColor(
                    currentBMI.category
                  )}`}
                >
                  {currentBMI.category}
                </p>
              </div>

              {(() => {
                const info = getBMIInfo(currentBMI.category);
                if (!info) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Range:</strong> {info.range}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {info.description}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Recommendation:</strong> {info.recommendation}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* BMI Categories Reference */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              BMI Categories
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                Underweight
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                BMI less than 18.5
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-1">
                Normal Weight
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                BMI between 18.5 and 24.9
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
              <p className="font-semibold text-orange-700 dark:text-orange-400 mb-1">
                Overweight
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                BMI between 25 and 29.9
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                Obese
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                BMI 30 or greater
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Note: BMI is a screening tool and does not directly measure body fat or
            health. Consult with a healthcare provider for personalized assessment.
          </p>
        </div>
      </div>

      {/* BMI History */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          BMI History
        </h3>
        {bmiHistory.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No BMI history yet. Calculate your first BMI above!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Height (cm)
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Weight (kg)
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    BMI
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {bmiHistory.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(log.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {log.height}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {log.weight}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {log.bmi}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`font-semibold ${getBMICategoryColor(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
