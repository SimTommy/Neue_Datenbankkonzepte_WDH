const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, 
  images: [{ type: String }],
  videos: [{ type: String }],
  documents: [{ type: String }]
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
