const express = require('express');
const router = express.Router();
const User = require('./models/User');
const Event = require('./models/Event');
const Comment = require('./models/Comment');

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
router.post('/events', async (req, res) => {
    // Event erstellen Logik
});

router.get('/events', async (req, res) => {
    // Alle Events abrufen Logik
});







//---------------- Kommentar Routen--------------------
router.post('/comments', async (req, res) => {
    // Kommentar erstellen Logik
});

module.exports = router;