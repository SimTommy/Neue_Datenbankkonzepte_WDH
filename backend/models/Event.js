const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  documents: { type: [String], default: [] },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    documents: { type: [String], default: [] }
  }],
  category: String,
  tags: [String],
  createdOn: { type: Date, default: Date.now },
  createdBy: { type: String } // Benutzername des Organisators
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
