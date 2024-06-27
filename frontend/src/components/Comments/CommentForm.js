import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './CommentForm.css';

const CommentForm = ({ eventId, onCommentAdded }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({ images: [], videos: [], documents: [] });

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setSelectedFiles((prevFiles) => ({
            ...prevFiles,
            [name]: files,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const commentData = { content, author: user.id };
            const commentResponse = await axios.post(`http://localhost:4000/api/events/${eventId}/comments`, commentData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const commentId = commentResponse.data._id;
            const formData = new FormData();
            for (const key in selectedFiles) {
                for (let i = 0; i < selectedFiles[key].length; i++) {
                    formData.append(key, selectedFiles[key][i]);
                }
            }

            if (formData.has('images') || formData.has('videos') || formData.has('documents')) {
                await axios.post(`http://localhost:4000/api/events/${eventId}/comments/${commentId}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }

            setContent('');
            setSelectedFiles({ images: [], videos: [], documents: [] });
            onCommentAdded();
        } catch (error) {
            console.error('Error adding comment:', error.response.data);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            <textarea name="content" placeholder="Add a comment" value={content} onChange={handleChange} required />
            <div>
                <label>Upload Images</label>
                <input type="file" name="images" multiple onChange={handleFileChange} />
            </div>
            <div>
                <label>Upload Videos</label>
                <input type="file" name="videos" multiple onChange={handleFileChange} />
            </div>
            <div>
                <label>Upload Documents</label>
                <input type="file" name="documents" multiple onChange={handleFileChange} />
            </div>
            <button type="submit">Add Comment</button>
        </form>
    );
};

export default CommentForm;
