import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { MainLayout } from './components/layout/MainLayout.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Auth } from './pages/Auth.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Workouts } from './pages/Workouts.jsx';
import { Nutrition } from './pages/Nutrition.jsx';
import { Water } from './pages/Water.jsx';
import { Progress } from './pages/Progress.jsx';
import { BMICalculator } from './pages/BMICalculator.jsx';
import { Profile } from './pages/Profile.jsx';

function App() {
  return (
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
