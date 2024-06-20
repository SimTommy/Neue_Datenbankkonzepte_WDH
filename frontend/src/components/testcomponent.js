import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestNavigation = () => {
    const navigate = useNavigate();
    return (
        <button onClick={() => navigate('/')}>Go to Home</button>
    );
};

export default TestNavigation;
