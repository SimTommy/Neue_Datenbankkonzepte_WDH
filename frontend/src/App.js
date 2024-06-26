import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homepage';
import NotFound from './pages/NotFound';
import Logout from './components/Auth/LogOut';
import CombinedAuthPage from './components/Auth/CombinedAuthPage';
import { AuthProvider } from './AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import EventPage from './components/Events/EventPage';
import EventDetails from './components/Events/EventDetails';
import AdminPanel from './components/Admin/AdminPanel';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import UserProfile from './components/Auth/UserProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/auth" element={<CombinedAuthPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
