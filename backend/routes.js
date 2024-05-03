const express = require('express');
const router = express.Router();

// Vordefinierte Schemata

const User = require('./models/User');
const Event = require('./models/Event');
const Comment = require('./models/Comment');


// Funktionen
const upload = require('./imageupload');

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
      const events = await Event.find().populate('organizer participants');
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Einzelne Veranstaltung abrufen
  router.get('/events/:id', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('organizer participants comments.author');
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

//---------------- Kommentar Routen--------------------
router.post('/comments', async (req, res) => {
    // Kommentar erstellen Logik
});

module.exports = router;
