const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['organizer', 'participant', 'admin'], default: 'participant' },
  // Zusätzliche Informationen können je nach Rolle hinzugefügt werden
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
