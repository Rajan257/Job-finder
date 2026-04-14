const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: [{ type: String }],
  education: { type: String },
  projects: [{ type: String }],
  githubProfile: { type: String },
  resumeText: { type: String }, // Raw parsed text of the resume
  resumeEmbedding: { type: [Number] }, // Embedding for the entire resume
  careerGoals: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
