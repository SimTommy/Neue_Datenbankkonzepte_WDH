import React from 'react';
import Login from './Login';
import Register from './Register';

const CombinedAuthPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
      <Login />
      <Register />
    </div>
  );
};

export default CombinedAuthPage;
