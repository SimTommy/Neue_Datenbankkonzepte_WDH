import React from 'react';
import { useAuth } from '../AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <h3>Welcome, {user.username || "Unknown"}!</h3>
          <p>Role: {user.role}</p>
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default UserProfile;
