import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './Messages.css';

const Messages = ({ setNewMessageCount }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      console.log("Fetching messages for selected user:", selectedUser);
      if (selectedUser) {
        try {
          const response = await axios.get(`http://localhost:4000/api/all-messages?userId=${selectedUser}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          console.log("Fetched messages:", response.data);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const handleChangeUser = (e) => {
    console.log("Changing user to:", e.target.value);
    setSelectedUser(e.target.value);
    setMessages([]);  // Reset messages when user is changed
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (selectedUser) {
        try {
          const response = await axios.get(`http://localhost:4000/api/messages?userId=${selectedUser}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const newMessages = response.data.filter(
            msg => !messages.some(m => m._id === msg._id)
          );
          if (newMessages.length > 0) {
            console.log("New messages received:", newMessages);
            setMessages(prevMessages => [...prevMessages, ...newMessages]);
            setNewMessageCount(prevCount => prevCount + newMessages.length);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedUser, messages, setNewMessageCount]);

  const handleSendMessage = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/messages', {
        receiverId: selectedUser,
        content: messageContent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newMessage = {
        ...response.data,
        sender: {
          _id: user.id,
          username: user.username,
          profileImage: user.profileImage || ''
        },
        createdAt: new Date().toISOString()
      };

      console.log("Message sent:", newMessage);

      setMessages([...messages, newMessage]);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`http://localhost:4000/api/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(messages.map(msg => msg._id === messageId ? { ...msg, read: true } : msg));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <div className="messages">
      <h2>Messages</h2>
      <div className="message-form">
        <select onChange={handleChangeUser} value={selectedUser || ''}>
          <option value="" disabled>Select user</option>
          {users.filter(u => u._id !== user.id).map(u => (
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <textarea 
          value={messageContent} 
          onChange={(e) => setMessageContent(e.target.value)} 
          placeholder="Type your message here..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div className="message-list">
        {messages.map(msg => (
          <div key={msg._id} className={`message ${msg.sender._id === user.id ? 'own-message' : ''}`} onClick={() => markAsRead(msg._id)}>
            {msg.sender.profileImage && (
              <img src={`http://localhost:4000${msg.sender.profileImage}`} alt="Profile" className="profile-image" />
            )}
            <div className="message-content">
              <strong>{msg.sender._id === user.id ? 'You' : msg.sender.username}</strong>: {msg.content}
              <div className="message-date">{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
