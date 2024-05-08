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
    // here maybe console log statement "Here all Users in the System" or something
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einzelnen Benutzer abrufen --> Erster Ansatz mit den vorgenerierten _id's von mongodb 
/*router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
*/

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


// Einzelnen User bearbeiten / updaten
router.put('/users/:userId', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { userId: parseInt(req.params.userId) }, // Verwenden von userId
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
router.delete('/users/:userId', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ userId: parseInt(req.params.userId) }); // Verwenden von userId
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

// Veranstaltung löschen
router.delete('/events/:id', async (req, res) => {
  try {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
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
router.delete('/comments/:commentId', async (req, res) => {
  try {
      const { commentId } = req.params;
      const comment = await Comment.findByIdAndDelete(commentId);
      if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
      }
      res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
