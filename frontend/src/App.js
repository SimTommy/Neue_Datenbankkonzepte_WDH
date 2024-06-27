import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homepage';
import NotFound from './pages/NotFound';
import Logout from './components/Auth/LogOut';
import CombinedAuthPage from './components/Auth/CombinedAuthPage';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import EventPage from './components/Events/EventPage';
import EventDetails from './components/Events/EventDetails';
import AdminPanel from './components/Admin/AdminPanel';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import UserProfile from './components/Auth/UserProfile';
import Messages from './components/Messages/Messages';
import './App.css';

function AppContent() {
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const { user } = useAuth();

  const fetchNewMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Wenn kein Token vorhanden ist, wird die Funktion abgebrochen

      const response = await axios.get('http://localhost:4000/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = response.data;
      setNewMessages(messages);
      setNewMessageCount(messages.length);
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`http://localhost:4000/api/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewMessages(newMessages.filter(msg => msg._id !== messageId));
      setNewMessageCount(newMessageCount - 1);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(fetchNewMessages, 5000); // Polling alle 5 Sekunden

      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <>
      <Header newMessageCount={newMessageCount} newMessages={newMessages} markAsRead={markAsRead} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/auth" element={<CombinedAuthPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/messages" element={<Messages setNewMessageCount={setNewMessageCount} />} />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
