const express = require('express');
const router = express.Router();

// Vordefinierte Schemata
const User = require('./models/User');
const Event = require('./models/Event');
const Comment = require('./models/Comment');
const Ticket = require('./models/Ticket');

// Funktionen
const upload = require('./imageupload');
const { comparePassword, generateToken, authenticateToken } = require('./auth');
const { sendEmail } = require('./notifications'); // Für die E-Mail notifs

//---------------------User Routen-------------------------

// Neuen User hinzufügen
router.post('/users', async (req, res) => {
    console.log("Attempting to create a user with:", req.body);  // Log the incoming request body
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error("Error creating user:", error.message);  // Log any errors
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

// Beispiel für eine geschützte Route
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

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
router.put('/events/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
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

// Route zum Hochladen von Bildern zu einem Event
router.post('/events/:id/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Kein Bild zum Hochladen erhalten' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        event.images.push(req.file.path); // Bildpfad zum Event hinzufügen
        await event.save();
        res.status(200).json({ message: 'Image uploaded successfully', path: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route zum Abrufen eines Bildes für ein bestimmtes Event | Path könnte falsch sein
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

        const imagePath = path.join(__dirname, '../public/uploads', filename);

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

//---------------- Kommentar Routen--------------------
// Kommentar erstellen
router.post('/events/:eventId/comments', async (req, res) => {
    try {
        const { content, author } = req.body;
        const { eventId } = req.params;

        // Überprüfen, ob das Event existiert
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const newComment = {
            content,
            author,
            createdAt: Date.now()
        };

        event.comments.push(newComment);
        await event.save();

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
router.put('/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const updatedComment = await Comment.findByIdAndUpdate(commentId, req.body, { new: true, runValidators: true });
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Einzelnen Kommentar löschen
router.delete('/events/:eventId/comments/:commentId', authenticateToken, async (req, res) => {
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

        // Überprüfen, ob der Benutzer der Autor des Kommentars oder ein Admin ist
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        event.comments.pull(commentId);
        await event.save();
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

// Route to delete all tickets
router.delete('/tickets', async (req, res) => {
    try {
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

module.exports = router;
