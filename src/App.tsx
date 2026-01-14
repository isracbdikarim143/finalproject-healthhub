import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Workouts } from './pages/Workouts';
import { Nutrition } from './pages/Nutrition';
import { Water } from './pages/Water';
import { Progress } from './pages/Progress';
import { BMICalculator } from './pages/BMICalculator';
import { Profile } from './pages/Profile';

function App() {
  return (
    // AUTH OPTIMIZATION: ErrorBoundary wraps entire app to catch crashes
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/auth" element={<Auth />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/workouts" element={<Workouts />} />
                        <Route path="/nutrition" element={<Nutrition />} />
                        <Route path="/water" element={<Water />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/bmi" element={<BMICalculator />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
