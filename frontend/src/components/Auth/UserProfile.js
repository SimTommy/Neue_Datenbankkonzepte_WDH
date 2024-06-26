import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState({ tickets: [], comments: [] });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/profile/activities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchProfile();
    fetchActivities();
  }, []);

  const handleProfileImageUpload = async (e) => {
    const formData = new FormData();
    formData.append('profileImage', e.target.files[0]);

    try {
      const response = await axios.post('http://localhost:4000/api/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile((prevProfile) => ({
        ...prevProfile,
        profileImage: response.data.profileImage
      }));
    } catch (error) {
      console.error('Error uploading profile image:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:4000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActivities(prevActivities => ({
        ...prevActivities,
        comments: prevActivities.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-profile">
      <h2>{profile.username}'s Profile</h2>
      <div className="profile-header">
        <div className="profile-image-container">
          <img src={`http://localhost:4000${profile.profileImage}`} alt="Profile" className="profile-image" />
        </div>
        <input type="file" onChange={handleProfileImageUpload} />
        <p className="profile-role">{profile.role}</p>
      </div>
      <div className="profile-activities">
        <h3>Tickets</h3>
        <ul>
          {activities.tickets.map(ticket => (
            <li key={ticket._id}>{ticket.event.title} - {new Date(ticket.purchaseDate).toLocaleString()}</li>
          ))}
        </ul>
        <h3>Comments</h3>
        <ul>
          {activities.comments.map(comment => (
            <li key={comment._id}>
              {comment.event.title} - {comment.content}
              <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
