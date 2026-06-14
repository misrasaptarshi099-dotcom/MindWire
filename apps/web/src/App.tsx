import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { WorkshopsCatalog } from './pages/WorkshopsCatalog';
import { UserLogin } from './pages/UserLogin';
import { UserSignup } from './pages/UserSignup';
import { UserDashboard } from './pages/UserDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function UserProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/workshops" element={<WorkshopsCatalog />} />
            <Route path="/workshops/:workshopId" element={<Landing />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            
            <Route path="/dashboard" element={
              <UserProtectedRoute>
                <UserDashboard />
              </UserProtectedRoute>
            } />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
