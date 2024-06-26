const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Comment = require('./models/Comment');
const multer = require('multer');

const userProfileUpload = multer({ dest: 'public/uploads/profile-images/' });

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.profileImage = req.body.profileImage || user.profileImage;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profileImage = `/uploads/profile-images/${req.file.filename}`;
        await user.save();
        res.json({ message: 'Profile image uploaded successfully', profileImage: user.profileImage });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserActivities = async (req, res) => {
    try {
        const tickets = await Ticket.find({ holder: req.user.id }).populate('event');
        const comments = await Comment.find({ author: req.user.id }).populate('event');

        res.json({ tickets, comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    userProfileUpload,
    uploadProfileImage,
    getUserActivities
};
