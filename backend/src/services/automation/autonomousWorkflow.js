const { autoApplyLinkedIn } = require('./autoApply');
const { autoMessageHR } = require('./outreachBot');
const Job = require('../../models/Job');
const UserProfile = require('../../models/UserProfile');

/**
 * Coordinates the full background workflow for a single job:
 * AI Analysis -> Auto-Apply -> HR Outreach
 * @param {object} jobData The job record from database
 */
async function runAutonomousWorkflow(jobId) {
  try {
    const job = await Job.findById(jobId);
    if (!job) return;

    const profile = await UserProfile.findOne();
    if (!profile) {
      console.warn("Skipping auto-workflow: No UserProfile found.");
      return;
    }

    console.log(`⚡ Starting Autonomous Workflow for: ${job.title} at ${job.company}`);

    // 1. Auto-Apply (Headless)
    // Note: We only auto-apply if it's potentially an Easy Apply job
    const applySuccess = await autoApplyLinkedIn(job.jobLink, profile);
    
    if (applySuccess) {
      job.status = 'Applied';
      job.appliedAt = new Date();
      await job.save();
      console.log(`✅ Auto-Applied to ${job.title}`);
    } else {
      console.log(`⏭️ Easy Apply not detected or failed for ${job.title}. Manual review needed.`);
    }

    // 2. HR Outreach (Headless)
    if (job.recruiterProfileUrl && job.recruiterName) {
      console.log(`📧 Attempting direct outreach to ${job.recruiterName}...`);
      await autoMessageHR(
        job.recruiterProfileUrl, 
        job.recruiterName, 
        job.company, 
        job.title
      );
      console.log(`✅ Outreach invitation sent to ${job.recruiterName}`);
    } else {
      console.log("⏭️ No recruiter profile found for outreach.");
    }

  } catch (err) {
    console.error("Autonomous Workflow Error:", err.message);
  }
}

module.exports = { runAutonomousWorkflow };
