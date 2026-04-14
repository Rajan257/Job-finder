const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  jobLink: { type: String },
  description: { type: String },
  extractedSkills: [{ type: String }],
  experienceLevel: { type: String },
  technologies: [{ type: String }],
  summary: { type: String },
  source: { type: String, enum: ['LinkedIn', 'Indeed', 'Internshala', 'Company', 'Manual'], default: 'LinkedIn' },
  datePosted: { type: String },
  embedding: { type: [Number] }, // Store Vector Embeddings for matching
  matchScore: { type: Number }, // Overall ranking score
  status: { type: String, enum: ['New', 'Saved', 'Applied', 'Rejected', 'Interview'], default: 'New' },
  appliedAt: { type: Date },
  followUpReminders: { type: Date },
  outreachMessage: { type: String },
  recruiterName: { type: String, default: 'Hiring Manager' }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
