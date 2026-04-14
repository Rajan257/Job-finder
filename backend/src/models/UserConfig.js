const mongoose = require('mongoose');

const UserConfigSchema = new mongoose.Schema({
  geminiApiKey: { type: String },
  linkedinCookie: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserConfig', UserConfigSchema);
