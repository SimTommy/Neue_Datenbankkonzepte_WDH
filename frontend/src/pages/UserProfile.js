import React from 'react';
import { useAuth } from '../AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="user-profile">
      {user ? (
        <>
          <h3 className="welcome">Welcome, {user.username || "Unknown"}!</h3>
          <p className="role">Role: {user.role}</p>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default UserProfile;
