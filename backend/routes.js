const express = require('express');
const router = express.Router();
const path = require('path');

// Vordefinierte Schemata
const User = require('./models/User');
const Event = require('./models/Event');
const Comment = require('./models/Comment');
const Ticket = require('./models/Ticket');
const Message = require('./models/Message');

// Funktionen
const upload = require('./mediaupload');
const { comparePassword, generateToken, authenticateToken } = require('./auth');
const { sendEmail } = require('./notifications'); // Für die E-Mail notifs
const { getProfile, updateProfile, userProfileUpload, uploadProfileImage, getUserActivities } = require('./userProfileLogic');

//---------------------User Routen-------------------------

// Neuen User hinzufügen
router.post('/users', async (req, res) => {
    console.log("Attempting to create a user with:", req.body);  
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error("Error creating user:", error.message);  
        res.status(400).json({ message: error.message });
    }
});

// Alle User abrufen
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelnen Benutzer anhand der userId abrufen
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: parseInt(req.params.userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelnen User aktualisieren
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Einzelnen User entfernen
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//--------------------- Registrierung + Login ------------------------------
// Benutzerregistrierung
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Benutzer erstellen (Passwort wird automatisch gehasht)
        const newUser = new User({ username, email, password, role });
        await newUser.save();

        const token = generateToken(newUser);
        res.status(201).json({ message: 'User registered', token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Benutzeranmeldung
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordIsValid = await comparePassword(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route zum Ändern der Benutzerrolle
router.put('/users/:id/role', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can change roles' });
        }
        
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Beispiel für eine geschützte Route
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});


// Profil-Route
router.get('/profile', authenticateToken, getProfile);

// Route zum Aktualisieren des Benutzerprofils
router.put('/profile', authenticateToken, updateProfile);

// Route zum Hochladen eines Profilbilds
router.post('/profile/upload', authenticateToken, userProfileUpload.single('profileImage'), uploadProfileImage);

// Route zum Abrufen von Benutzeraktivitäten
router.get('/profile/activities', authenticateToken, getUserActivities);







//--------------------- Event Routen -----------------------------
// Veranstaltung erstellen
router.post('/events', async (req, res) => {
    console.log("Attempting to create an Event with:", req.body);
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Alle Veranstaltungen abrufen
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'username email')
            .populate('participants', 'username email')
            .populate({
                path: 'comments.author',
                select: 'username email'
            });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelne Veranstaltung abrufen
router.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'username email')
            .populate('participants', 'username email')
            .populate({
                path: 'comments.author',
                select: 'username email'
            });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Veranstaltung aktualisieren
router.put('/events/:id', authenticateToken, async (req, res) => {
    try {
        console.log('Received update request for event ID:', req.params.id);
        console.log('Request body:', req.body); // Debugging

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Überprüfen, ob der Benutzer der Organisator des Events oder ein Admin ist
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update this event' });
        }

        
        event.title = req.body.title;
        event.description = req.body.description;
        event.location = req.body.location;
        event.startTime = req.body.startTime;
        event.endTime = req.body.endTime;

        
        if (!req.body.participants) {
            event.participants = event.participants;
        }

        await event.save();

        
        const updatedEvent = await Event.findById(req.params.id)
            .populate('organizer', 'username email')
            .populate('participants', 'username email');

        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(400).json({ message: error.message });
    }
});



// Veranstaltung löschen und zugehörige Tickets und Kommentare löschen
router.delete('/events/:id', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'role');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Überprüfen, ob der Benutzer der Organisator des Events oder ein Admin ist
        if (event.organizer._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }

        await Comment.deleteMany({ event: req.params.id });
        await Ticket.deleteMany({ event: req.params.id });
        await Event.deleteOne({ _id: req.params.id });

        res.json({ message: 'Event and related comments and tickets deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//------------Bilder Hochladen -----------------------

// Route zum Hochladen von Medien zu einem Event
router.post('/events/:id/upload', upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 },
    { name: 'documents', maxCount: 5 }
]), async (req, res) => {
    try {
        console.log('Uploading media for event ID:', req.params.id); // Debugging statement
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Initializierung der Arrays wenn nicht präsent
        event.images = event.images || [];
        event.videos = event.videos || [];
        event.documents = event.documents || [];

        if (req.files['images']) {
            event.images.push(...req.files['images'].map(file => `/uploads/${file.filename}`));
            console.log('Uploaded images:', event.images); // Debugging statement
        }

        if (req.files['videos']) {
            event.videos.push(...req.files['videos'].map(file => `/uploads/${file.filename}`));
            console.log('Uploaded videos:', event.videos); // Debugging statement
        }

        if (req.files['documents']) {
            event.documents.push(...req.files['documents'].map(file => `/uploads/${file.filename}`));
            console.log('Uploaded documents:', event.documents); // Debugging statement
        }

        await event.save();
        res.status(200).json({ message: 'Media uploaded successfully', paths: req.files });
    } catch (error) {
        console.error('Error uploading media:', error); // Debugging statement
        res.status(500).json({ message: error.message });
    }
});

// Route zum Abrufen eines Bildes
router.get('/uploads/:filename', (req, res) => {
    const filepath = path.join(__dirname, './public/uploads', req.params.filename);
    console.log('Fetching file:', filepath); // Debugging statement
    res.sendFile(filepath);
});


// Route zum Abrufen eines Bildes für ein bestimmtes Event 
router.get('/events/:id/images/:filename', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const filename = req.params.filename;
        if (!event.images.includes(filename)) {
            return res.status(404).json({ message: 'Image not found for this event' });
        }

        const imagePath = path.join(__dirname, './public/uploads', filename);

        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'Image file not found' });
            }

            res.sendFile(imagePath);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route zum Entfernen von Medien
router.post('/events/:id/remove-media', authenticateToken, async (req, res) => {
    try {
        const { mediaType, mediaPath } = req.body;
        console.log('Removing media:', { mediaType, mediaPath, eventId: req.params.id }); // Debugging statement
        const event = await Event.findById(req.params.id);

        if (!event) {
            console.log('Event not found');
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is the organizer or an admin
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            console.log('User not authorized to remove media');
            return res.status(403).json({ message: 'You are not authorized to remove media from this event' });
        }

        if (mediaType === 'image') {
            event.images = event.images.filter(path => path !== mediaPath);
            console.log('Updated images:', event.images); // Debugging statement
        } else if (mediaType === 'video') {
            event.videos = event.videos.filter(path => path !== mediaPath);
            console.log('Updated videos:', event.videos); // Debugging statement
        } else if (mediaType === 'document') {
            event.documents = event.documents.filter(path => path !== mediaPath);
            console.log('Updated documents:', event.documents); // Debugging statement
        }

        await event.save();
        res.json({ message: 'Media removed successfully' });
    } catch (error) {
        console.error('Error removing media:', error); // Debugging statement
        res.status(500).json({ message: error.message });
    }
});
  


//---------------- Kommentar Routen--------------------
// Kommentar erstellen
router.post('/events/:eventId/comments', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const newComment = new Comment({
            content,
            author: req.user.id,
            event: eventId
        });

        event.comments.push(newComment);
        await event.save();
        await newComment.save();

        const user = await User.findById(req.user.id);
        user.postedComments.push(newComment._id);
        await user.save();

        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Alle Kommentare zu einem bestimmten Event abrufen
router.get('/events/:eventId/comments', async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId)
            .populate({
                path: 'comments.author',
                select: 'username email'
            });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Alle Kommentare abrufen
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('author', 'username email')
            .populate('event', 'title');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Einzelnen Kommentar abrufen
router.get('/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId)
            .populate('author', 'username email')
            .populate('event', 'title');
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelnen Kommentar bearbeiten / updaten
router.put('/events/:eventId/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const { eventId, commentId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const comment = event.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Überprüfen, ob der Benutzer der Autor des Kommentars ist
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }

        Object.assign(comment, req.body);
        await event.save();
        
        res.json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Einzelnen Kommentar löschen
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Überprüfen, ob der Benutzer der Autor des Kommentars oder ein Admin ist
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        const event = await Event.findById(comment.event);
        if (event) {
            event.comments.pull(commentId);
            await event.save();
        }

        await Comment.findByIdAndDelete(commentId);

        const user = await User.findById(comment.author);
        if (user) {
            user.postedComments.pull(commentId);
            await user.save();
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Route to delete all comments
router.delete('/comments', async (req, res) => {
    try {
        await Comment.deleteMany({});
        res.json({ message: 'All comments deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//------------------ Routen für Kommentar-Medien-Upload ---------------------

// Route zum Hochladen von Medien zu einem Kommentar
router.post('/events/:eventId/comments/:commentId/upload', upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 },
    { name: 'documents', maxCount: 5 }
]), authenticateToken, async (req, res) => {
    try {
        const { eventId, commentId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const comment = event.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Überprüfen, ob der Benutzer der Autor des Kommentars ist
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to upload media to this comment' });
        }

        if (req.files['images']) {
            comment.images.push(...req.files['images'].map(file => `/uploads/${file.filename}`));
        }

        if (req.files['videos']) {
            comment.videos.push(...req.files['videos'].map(file => `/uploads/${file.filename}`));
        }

        if (req.files['documents']) {
            comment.documents.push(...req.files['documents'].map(file => `/uploads/${file.filename}`));
        }

        await event.save();
        res.status(200).json({ message: 'Media uploaded successfully', paths: req.files });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route zum Entfernen von Medien aus einem Kommentar
router.post('/comments/:commentId/remove-media', authenticateToken, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { mediaType, mediaPath } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Überprüfen, ob der Benutzer der Autor des Kommentars oder ein Admin ist
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to remove media from this comment' });
        }

        if (mediaType === 'image') {
            comment.images = comment.images.filter(path => path !== mediaPath);
        } else if (mediaType === 'video') {
            comment.videos = comment.videos.filter(path => path !== mediaPath);
        } else if (mediaType === 'document') {
            comment.documents = comment.documents.filter(path => path !== mediaPath);
        }

        await comment.save();
        res.json({ message: 'Media removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  

//------------------ Tickets -------------------

// Route to get all tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('event', 'title')
            .populate('holder', 'username email');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route zum Löschen aller Tickets und Aktualisieren des Events
router.delete('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        for (const ticket of tickets) {
            const event = await Event.findById(ticket.event);
            if (event) {
                event.participants = event.participants.filter(participant => participant.toString() !== ticket.holder.toString());
                await event.save();
            }
        }
        await Ticket.deleteMany({});
        res.json({ message: 'All tickets deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Veranstaltung löschen und zugehörige Tickets löschen
router.delete('/events/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Lösche alle Tickets, die zu diesem Event gehören
        await Ticket.deleteMany({ event: req.params.id });

        res.json({ message: 'Event and associated tickets deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ticketkauf
router.post('/events/:eventId/tickets', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Prüfen, ob der Benutzer bereits Teilnehmer ist
        if (event.participants.includes(req.user.id)) {
            return res.status(400).json({ message: 'User already a participant' });
        }

        const newTicket = new Ticket({
            event: eventId,
            holder: req.user.id
        });

        await newTicket.save();
        event.participants.push(req.user.id);
        await event.save();

        res.status(201).json(newTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Alle Tickets für einen Benutzer abrufen
router.get('/users/:userId/tickets', authenticateToken, async (req, res) => {
    try {
        const tickets = await Ticket.find({ holder: req.user.id }).populate('event', 'title location');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelnes Ticket löschen (Stornieren)
router.delete('/tickets/:ticketId', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Überprüfen, ob der Benutzer der Besitzer des Tickets oder ein Admin ist
        if (ticket.holder.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this ticket' });
        }

        const event = await Event.findById(ticket.event);
        if (event) {
            event.participants = event.participants.filter(participant => participant.toString() !== ticket.holder.toString());
            await event.save();
        }

        await Ticket.findByIdAndDelete(req.params.ticketId);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



//----------- E-Mail Erinnerung Event ------------
// Wird vermutlich erst möglich sein, wenn wir eine trash mail verwenden auf die jeder zugriff hat. selbe bei .env dann einstellen und testen
// Vorerst ausgelassen
router.post('/events/:eventId/notify', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId).populate('participants', 'email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        for (const participant of event.participants) {
            await sendEmail(participant.email, `Erinnerung: ${event.title}`, `Das Event ${event.title} findet bald statt.`);
        }

        res.status(200).json({ message: 'Reminder emails sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//------------------ Nachrichtensystem ----------------

// Nachricht senden
router.post('/messages', authenticateToken, async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    try {
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            read: false // Initialisieren Sie das read-Feld
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Nachrichten für einen Benutzer abrufen (nur ungelesene Nachrichten)
router.get('/messages', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const messages = await Message.find({
            receiver: userId,
            read: false
        }).populate('sender', 'username profileImage').sort('createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Nachricht als gelesen markieren
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Überprüfen, ob der Benutzer der Empfänger ist
        if (message.receiver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to mark this message as read' });
        }

        message.read = true;
        await message.save();

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Alle Nachrichten für einen Benutzer abrufen (gelesene und ungelesene)
router.get('/all-messages', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { userId: otherUserId } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).populate('sender', 'username profileImage').sort('createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;
