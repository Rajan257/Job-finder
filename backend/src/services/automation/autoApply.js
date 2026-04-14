const { chromium } = require('playwright');
const { generateText } = require('../ai/gemini');

/**
 * Automates applying to a job using LinkedIn Easy Apply.
 * Note: Highly dependent on LinkedIn's UI. Might break easily!
 * @param {string} jobUrl 
 * @param {object} profile User profile object with resume details
 */
async function autoApplyLinkedIn(jobUrl, profile) {
  // Use a user data dir so we can keep session cookies
  // Or pass a cookie array via context.addCookies()
  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Starting auto-apply for: ${jobUrl}`);

  try {
    // Navigate to job
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });

    // Look for Easy Apply button
    const easyApplyBtn = page.locator('button:has-text("Easy Apply")');
    if (await easyApplyBtn.count() > 0) {
      await easyApplyBtn.click();
      
      // Wait for modal
      await page.waitForSelector('.jobs-easy-apply-modal', { state: 'visible' });

      // In a real scenario, you have to iterate through 'Next' buttons,
      // fill out radio buttons, upload PDF document, etc.
      console.log('Easy apply modal opened. Navigating forms...');
      
      // MOCK BEHAVIOR:
      // generate cover letter with Gemini
      const coverLetterPrompt = `Generate a short, professional cover letter for ${profile.name} applying to a job. Resume summary: ${profile.resumeText}`;
      const coverLetter = await generateText(coverLetterPrompt);
      
      console.log("Generated Cover Letter:\n", coverLetter);

      // We'll close the browser here instead of actually applying to avoid accidental submissions
      // await page.locator('button:has-text("Submit application")').click();
      
      return true; // Successfully ran Easy Apply
    } else {
      console.log("No Easy Apply button found.");
      return false;
    }

  } catch (error) {
    console.error("Auto Apply Error:", error);
    return false;
  } finally {
    await browser.close();
  }
}

module.exports = {
  autoApplyLinkedIn
};
