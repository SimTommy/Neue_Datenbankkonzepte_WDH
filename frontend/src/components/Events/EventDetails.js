import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TicketButton from '../Tickets/TicketButton';
import CommentForm from '../Comments/CommentForm';
import MediaCarousel from './MediaCarousel';
import { useAuth } from '../../AuthContext';
import EditEventModal from './EditEventModal';
import './EventDetails.css';
import '../Comments/Comment.css';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({ images: [], videos: [], documents: [] });
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchEvent = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/events/${id}`);
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchEvent();
    }, [id, fetchEvent]);

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:4000/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchEvent();
        } catch (error) {
            console.error('Error deleting comment:', error.response.data);
        }
    };

    const handleDeleteEvent = async () => {
        try {
            await axios.delete(`http://localhost:4000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            window.location.href = '/events';
        } catch (error) {
            console.error('Error deleting event:', error.response.data);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setSelectedFiles((prevFiles) => ({
            ...prevFiles,
            [name]: files,
        }));
    };

    const handleUpload = async () => {
        const formData = new FormData();
        for (const key in selectedFiles) {
            for (let i = 0; i < selectedFiles[key].length; i++) {
                formData.append(key, selectedFiles[key][i]);
            }
        }

        try {
            await axios.post(`http://localhost:4000/api/events/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            fetchEvent();
        } catch (error) {
            console.error('Error uploading files:', error.response.data);
        }
    };

    const handleEditEvent = (updatedEvent) => {
        setEvent(updatedEvent);
        setShowEditModal(false);
    };

    const handleRemoveMedia = async (mediaType, mediaPath) => {
        const relativePath = mediaPath.replace('http://localhost:4000', '');
        try {
            const response = await axios.post(`http://localhost:4000/api/events/${id}/remove-media`, { mediaType, mediaPath: relativePath }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            fetchEvent();
        } catch (error) {
            console.error('Error removing media:', error.response.data);
        }
    };

    if (!event) {
        return <p>Loading...</p>;
    }

    const images = event.images || [];
    const videos = event.videos || [];
    const documents = event.documents || [];

    return (
        <div className="event-details">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>{new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
            <p>Location: {event.location}</p>
            <p>Organizer: {event.organizer.username}</p>
            <MediaCarousel
                media={[
                    ...images.map((path, index) => ({ path: `http://localhost:4000${path}`, type: 'image', key: `image-${index}` })),
                    ...videos.map((path, index) => ({ path: `http://localhost:4000${path}`, type: 'video', key: `video-${index}` })),
                    ...documents.map((path, index) => ({ path: `http://localhost:4000${path}`, type: 'document', key: `document-${index}` }))
                ]}
                onRemoveMedia={handleRemoveMedia}
            />
            <h3>Participants:</h3>
            <ul>
                {event.participants.map((participant, index) => (
                    <li key={participant._id || `participant-${index}`}>
                        {participant.username} ({participant.email})
                    </li>
                ))}
            </ul>
            <h3>Comments:</h3>
            <ul>
                {event.comments.map((comment, index) => (
                    <li key={comment._id || `comment-${index}`}>
                        <strong>{comment.author.username}:</strong> {comment.content}
                        <div className="comment-media">
                            {comment.images.map((image, i) => (
                                <img key={`comment-image-${i}`} className="comment-media" src={`http://localhost:4000${image}`} alt="comment media" />
                            ))}
                            {comment.videos.map((video, i) => (
                                <video key={`comment-video-${i}`} className="comment-media" controls>
                                    <source src={`http://localhost:4000${video}`} type="video/mp4" />
                                </video>
                            ))}
                            {comment.documents.map((doc, i) => (
                                <a key={`comment-doc-${i}`} className="comment-media" href={`http://localhost:4000${doc}`} target="_blank" rel="noopener noreferrer">
                                    Document {i + 1}
                                </a>
                            ))}
                        </div>
                        {(user && (user.id === comment.author._id || user.role === 'admin')) && (
                            <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
            <TicketButton eventId={event._id} onPurchase={fetchEvent} />
            <CommentForm eventId={event._id} onCommentAdded={fetchEvent} />
            {user && (user.id === event.organizer._id || user.role === 'admin') && (
                <>
                    <button onClick={() => setShowEditModal(true)}>Edit Event</button>
                    <button onClick={handleDeleteEvent}>Delete Event</button>
                    <div className="upload-buttons">
                        <label htmlFor="upload-images">Upload Images</label>
                        <input type="file" id="upload-images" name="images" multiple onChange={handleFileChange} />
                        <label htmlFor="upload-videos">Upload Videos</label>
                        <input type="file" id="upload-videos" name="videos" multiple onChange={handleFileChange} />
                        <label htmlFor="upload-documents">Upload Documents</label>
                        <input type="file" id="upload-documents" name="documents" multiple onChange={handleFileChange} />
                        <button className="upload-button" onClick={handleUpload}>Upload</button>
                        <p className="upload-instructions">Please use the respective buttons to upload images, videos, or documents, and click 'Upload' to save them.</p>
                    </div>
                </>
            )}
            <EditEventModal
                show={showEditModal}
                event={event}
                onClose={() => setShowEditModal(false)}
                onSave={handleEditEvent}
            />
            <Link to="/events" className="back-button">Go Back to Event List</Link>
        </div>
    );
};

export default EventDetails;
