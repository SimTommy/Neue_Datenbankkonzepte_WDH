import React, { useState } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ newMessageCount, newMessages, markAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell">
      <div className="bell-icon" onClick={toggleDropdown}>
        🔔
        {newMessageCount > 0 && <span className="badge">{newMessageCount}</span>}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {newMessages.length > 0 ? (
            newMessages.map((message) => (
              <div 
                key={message._id} 
                className="dropdown-item" 
                onClick={() => {
                  markAsRead(message._id);
                  setIsOpen(false);
                }}>
                <strong>{message.sender.username}</strong>: {message.content}
              </div>
            ))
          ) : (
            <div className="dropdown-item">No new messages</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
