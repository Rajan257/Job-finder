const cron = require('node-cron');
const { scrapeLinkedInJobs } = require('../services/scraper/linkedin');
const { autoApplyLinkedIn } = require('../services/automation/autoApply');
const { autoPostToLinkedIn } = require('../services/automation/outreachBot');
const { analyzeJobDescription } = require('../services/ai/gemini');
const Job = require('../models/Job');
const UserProfile = require('../models/UserProfile');
const { cosineSimilarity } = require('../utils/math');

console.log("Autonomous Scheduler (Hourly) Initialized.");

// Expanded target search queries
const TARGET_SEARCHES = [
  'Software Engineer Intern',
  'Software Developer Intern',
  'Frontend Developer Intern',
  'Backend Developer Intern',
  'Full Stack Intern',
  'AI Research Intern',
  'Entry Level Software Engineer'
];

// Schedule: Runs every hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
  console.log('--- STARTING HOURLY AUTONOMOUS MONITORING ---');
  try {
    // 1. Scrape new jobs (Using session cookie for deep scan)
    const UserConfig = require('../models/UserConfig');
    const config = await UserConfig.findOne();
    const cookie = config ? config.linkedinCookie : null;

    const randomQuery = TARGET_SEARCHES[Math.floor(Math.random() * TARGET_SEARCHES.length)];
    console.log(`Searching for: ${randomQuery}`);
    await scrapeLinkedInJobs(randomQuery, 'Remote', cookie);
    
    // 2. Fetch User Profile
    const userProfile = await UserProfile.findOne();
    if (!userProfile) {
      console.warn("No UserProfile found. Please set up profile in Dashboard/Settings.");
      return;
    }

    // 3. Process new jobs (Analyze + Embed + Score)
    const newJobs = await Job.find({ status: 'New', matchScore: { $exists: false } });
    console.log(`Processing ${newJobs.length} new jobs for analysis...`);

    for (const job of newJobs) {
      try {
        // AI Structured Analysis
        const analysis = await analyzeJobDescription(job.description);
        job.extractedSkills = analysis.extractedSkills;
        job.experienceLevel = analysis.experienceLevel;
        job.technologies = analysis.technologies;
        job.summary = analysis.summary;

        // Matching Score
        if (userProfile.resumeEmbedding && userProfile.resumeEmbedding.length > 0) {
          const score = cosineSimilarity(userProfile.resumeEmbedding, job.embedding);
          job.matchScore = Math.round(score * 100);
        }

        // --- NEW: Recruiter Outreach Trigger (Score > 85) ---
        if (job.matchScore > 85) {
          console.log(`High match found (${job.matchScore}%) for ${job.title}. Generating outreach...`);
          const { generateOutreachMessage } = require('../services/ai/gemini');
          job.outreachMessage = await generateOutreachMessage(job, userProfile);
        }

        await job.save();
        console.log(`Analyzed: ${job.title} at ${job.company} - Match: ${job.matchScore}%`);
      } catch (err) {
        console.error(`Error processing job ${job.title}:`, err.message);
      }
    }

    // 4. (Optional) Auto Apply to high-match jobs (e.g. > 90%)
    const highMatchJobs = await Job.find({ status: 'New', matchScore: { $gt: 90 } }).limit(2);
    for (const job of highMatchJobs) {
      console.log(`Auto-Applying to high-match role: ${job.title}`);
      const success = await autoApplyLinkedIn(job.jobLink, userProfile);
      if (success) {
        job.status = 'Applied';
        job.appliedAt = new Date();
        await job.save();
      }
    }

    console.log('--- HOURLY WORKFLOW COMPLETE ---');
  } catch (error) {
    console.error("Scheduler Error:", error);
  }
});

// Minute-by-Minute Worker: Checks for scheduled LinkedIn posts
cron.schedule('* * * * *', async () => {
  const ScheduledPost = require('../models/ScheduledPost');
  const { directPostToLinkedIn } = require('../services/automation/directPost');
  
  try {
    const now = new Date();
    // Find posts that are PENDING and scheduled for NOW or in the PAST
    const pendingPosts = await ScheduledPost.find({
      status: 'Pending',
      scheduledAt: { $lte: now }
    });

    if (pendingPosts.length > 0) {
      console.log(`[MinuteWorker] Found ${pendingPosts.length} posts due for publishing...`);
    }

    for (const post of pendingPosts) {
      try {
        await directPostToLinkedIn(post.content, post.mediaFile);
        post.status = 'Success';
        await post.save();
      } catch (err) {
        console.error(`[MinuteWorker] Failed to publish post ${post._id}:`, err.message);
        post.status = 'Failed';
        post.error = err.message;
        await post.save();
      }
    }
  } catch (err) {
    console.error("[MinuteWorker] Critical Error:", err.message);
  }
});
