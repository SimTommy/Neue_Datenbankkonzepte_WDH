import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);  // Neuer Zustand, um den Login-Status zu verfolgen
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');  // Navigiere zur Homepage, wenn der Benutzer eingeloggt ist
            setTimeout(() => {
                window.location.reload(); // Seite nach 3 Sekunden neu laden
            }, 1000);
        }
    }, [isLoggedIn, navigate]);  // Abhängigkeiten für useEffect

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/login', formData);
            console.log('Login successful:', response.data);
            localStorage.setItem('token', response.data.token); // Token im LocalStorage speichern
            setIsLoggedIn(true);  // Setze den Login-Status auf true
        } catch (error) {
            if (error.response) {
                console.error('Login error:', error.response.data);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
