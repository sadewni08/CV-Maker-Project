// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CVProvider } from './contexts/CVContext';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CVListing from './pages/CVListing';
import CVForm from './pages/CVForm';
import CVView from './pages/CVView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CVProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cvs" element={<CVListing />} />
                <Route path="cv/new" element={<CVForm />} />
                <Route path="cv/edit/:id" element={<CVForm />} />
                <Route path="cv/view/:id" element={<CVView />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </CVProvider>
    </AuthProvider>
  );
}

export default App;