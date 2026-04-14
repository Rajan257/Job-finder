const Job = require('../models/Job');
const UserProfile = require('../models/UserProfile');
const { generateEmbedding } = require('../services/ai/gemini');

// --- JOB CONTROLLERS ---

exports.getJobs = async (req, res) => {
  try {
    // Return jobs sorted by match score
    const jobs = await Job.find().sort({ matchScore: -1, createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status, nextFollowUp, outreachMessage } = req.body;
    const updateData = { status };
    if (nextFollowUp) updateData.followUpReminders = nextFollowUp;
    if (outreachMessage) updateData.outreachMessage = outreachMessage;
    if (status === 'Applied') updateData.appliedAt = new Date();

    const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const { keyword, location, autonomousMode } = req.body;
    const { scrapeLinkedInJobs } = require('../services/scraper/linkedin');
    const { runAutonomousWorkflow } = require('../services/automation/autonomousWorkflow');
    
    // Fetch stored session cookie to enable "Deep Scan" as a logged-in user
    const UserConfig = require('../models/UserConfig');
    const config = await UserConfig.findOne();
    const cookie = config ? config.linkedinCookie : null;

    const results = await scrapeLinkedInJobs(keyword || 'Software Engineer Intern', location || 'Remote', cookie);

    // If Autonomous Mode is active, trigger background workflows for high-match jobs
    if (autonomousMode) {
      console.log("⚡ Autonomous Mode Active: Triggering background apply/outreach...");
      // For each job found, if its score is > 80 (or just all for now to be safe), trigger workflow
      for (const job of results) {
         // Background trigger (don't await to avoid blocking response)
         runAutonomousWorkflow(job._id);
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateOutreach = async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    const profile = await UserProfile.findOne();
    const { generateOutreachMessage } = require('../services/ai/gemini');
    
    const message = await generateOutreachMessage(job, profile);
    job.outreachMessage = message;
    await job.save();
    
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePost = async (req, res) => {
  try {
    const { topic } = req.body;
    const { generateText } = require('../services/ai/gemini');
    
    const prompt = `Write a high-engagement LinkedIn post about: ${topic}. 
    Make it professional, use emojis, and add relevant hashtags. 
    Focus on career growth and technology.`;
    
    const post = await generateText(prompt);
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.schedulePost = async (req, res) => {
  try {
    const { content, scheduledAt, mediaFile } = req.body;
    const ScheduledPost = require('../models/ScheduledPost');
    const newPost = await ScheduledPost.create({
      content,
      scheduledAt: new Date(scheduledAt),
      mediaFile,
      status: 'Pending'
    });
    res.json({ message: "Post scheduled successfully!", post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScheduledPosts = async (req, res) => {
  try {
    const ScheduledPost = require('../models/ScheduledPost');
    const posts = await ScheduledPost.find().sort({ scheduledAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteScheduledPost = async (req, res) => {
  try {
    const ScheduledPost = require('../models/ScheduledPost');
    await ScheduledPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    let { title, company, location, status, jobLink, description } = req.body;
    
    // Ensure every job has a unique link even if manual
    if (!jobLink) {
      jobLink = `manual://${company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }

    const newJob = await Job.create({
      title, 
      company, 
      location: location || 'Remote', 
      status, 
      jobLink, 
      description: description || 'Manual application added via Tracker.',
      source: 'Manual', 
      appliedAt: new Date()
    });
    res.json(newJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAPIKeys = async (req, res) => {
  try {
    const { geminiApiKey, linkedinCookie } = req.body;
    const UserConfig = require('../models/UserConfig');
    const config = await UserConfig.findOneAndUpdate(
      {}, 
      { geminiApiKey, linkedinCookie, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Update process.env at runtime so services can use them immediately
    if (geminiApiKey) process.env.GEMINI_API_KEY = geminiApiKey;
    if (linkedinCookie) process.env.LINKEDIN_SESSION_COOKIE = linkedinCookie;

    res.json({ message: "API Keys updated and applied.", updatedAt: config.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- PROFILE CONTROLLERS ---

exports.getProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne();
    if (!profile) return res.json({});
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, skills, education, projects, githubProfile, resumeText } = req.body;
    
    // Convert skills string to array if needed
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    
    // Generate new embedding if resume changed
    let resumeEmbedding = undefined;
    if (resumeText) {
      resumeEmbedding = await generateEmbedding(resumeText);
    }

    const profile = await UserProfile.findOneAndUpdate(
      {}, 
      { name, email, skills: skillsArray, education, projects, githubProfile, resumeText, resumeEmbedding },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
