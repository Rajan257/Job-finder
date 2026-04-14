const mongoose = require('mongoose');

const ScheduledPostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  mediaFile: { type: String }, // Optional path or base64
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledPost', ScheduledPostSchema);
