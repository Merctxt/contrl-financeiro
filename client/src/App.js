import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Categories from './pages/Categories/Categories';
import Goals from './pages/goals/goals';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  return !token ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/reset-password/:token" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } />
            <Route path="/categories" element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            <Route path="/goals" element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
