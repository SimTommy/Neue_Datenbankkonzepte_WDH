import React from 'react';
import Login from './Login';
import Register from './Register';
import './CombinedAuthPage.css';

const CombinedAuthPage = () => {
  return (
    <div className="combined-auth">
      <Login />
      <Register />
    </div>
  );
};

export default CombinedAuthPage;
