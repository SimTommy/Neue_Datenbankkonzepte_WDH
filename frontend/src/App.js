import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/homepage';
import NotFound from './pages/NotFound';
import Logout from './components/Auth/LogOut';
import CombinedAuthPage from './components/Auth/CombinedAuthPage';
import UserProfile from './pages/UserProfile';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/auth">Auth</Link>
            <Link to="/logout">Logout</Link>
            <UserProfile />
          </nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<CombinedAuthPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
