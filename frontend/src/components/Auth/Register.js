import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Importiere das CSS für das Register-Formular

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'participant'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/register', formData);
            console.log('Registered:', response.data);
            // Redirect to login or dashboard
        } catch (error) {
            if (error.response) {
                console.error('Registration error:', error.response.data);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                onChange={handleChange} 
                required 
            />
            <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                onChange={handleChange} 
                required 
            />
            <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
            />
            <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                required
            >
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
            </select>
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;
