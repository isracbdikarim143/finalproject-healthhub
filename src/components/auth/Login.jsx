import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../Toast';
import { LogIn } from 'lucide-react';


export function Login({ onToggle  }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // AUTH OPTIMIZATION: Client-side validation before API call
  const validateForm = () => {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('⚠️ Please enter a valid email address');
      return false;
    }

    // Password length validation (min 6 characters)
    if (password.length < 6) {
      toast.error('⚠️ Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // AUTH OPTIMIZATION: Validate before sending request
    if (!validateForm()) return;
    
    // AUTH OPTIMIZATION: Disable button and show loading state
    setLoading(true);

    try {
      // AUTH OPTIMIZATION: Send request to Supabase Auth with real credentials
      await signIn(email, password);
      
      // AUTH OPTIMIZATION: Show success toast (redirect handled by Auth page)
      toast.success('✅ Logged in successfully');
    } catch (error) {
      // AUTH OPTIMIZATION: Show friendly error messages
      toast.error(error.message || 'Failed to sign in');
    } finally {
      // AUTH OPTIMIZATION: Re-enable button
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to <span className="text-primary-600">HealthHub</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue your health journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 6 characters
            </p>
          </div>

          {/* AUTH OPTIMIZATION, shows loading text */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onToggle}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
