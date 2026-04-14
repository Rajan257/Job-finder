const { chromium } = require('playwright');
const Job = require('../../models/Job');
const { generateEmbedding } = require('../ai/gemini');

/**
 * A sample scraper that hits LinkedIn jobs locally (without login for basic search).
 * Caution: LinkedIn aggressively blocks basic scrapers. In production, 
 * use residential proxies and session cookies.
 * @param {string} keyword e.g., 'Software Engineering Intern'
 * @param {string} location e.g., 'United States'
 */
async function scrapeLinkedInJobs(keyword, location, sessionCookie) {
  console.log(`🚀 Starting Deep Scan for ${keyword} in ${location}...`);
  
  // Use headless for background scans
  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });

  // Inject session cookie if provided
  if (sessionCookie) {
    await context.addCookies([{
      name: 'li_at',
      value: sessionCookie,
      domain: '.www.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }]);
  }

  const page = await context.newPage();
  const jobsAdded = [];

  try {
    // Navigate to logged-in search URL
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the job list to load
    await page.waitForSelector('.jobs-search-results-list', { timeout: 15000 }).catch(() => null);

    // DEEP SCROLL: Scroll the job list pane to load more items
    console.log("📜 Scrolling to discover 'huge amounts' of jobs...");
    for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
            const container = document.querySelector('.jobs-search-results-list') || window;
            container.scrollBy(0, 800);
        });
        await page.waitForTimeout(2000);
    }

    // Capture job items (Using common selectors for logged-in view)
    const jobItems = await page.locator('.jobs-search-results__list-item').all();
    console.log(`🎯 Found ${jobItems.length} potential matches.`);

    for (const item of jobItems.slice(0, 25)) { // Increase limit to 25
      try {
        const title = await item.locator('.job-card-list__title').innerText().catch(() => 'Unknown');
        const company = await item.locator('.job-card-container__primary-description').innerText().catch(() => 'Unknown');
        const link = await item.locator('a.job-card-list__title').getAttribute('href').catch(() => '');
        const jobLocation = await item.locator('.job-card-container__metadata-item').first().innerText().catch(() => 'Remote');

        const jobLink = link ? (link.startsWith('http') ? link : `https://www.linkedin.com${link}`) : '';
        if (!jobLink) continue;

        const existingJob = await Job.findOne({ jobLink });
        if (!existingJob) {
          // Identify recruiter/poster if available
          const recruiterName = await item.locator('.jobs-poster__name').innerText().catch(() => '');
          const recruiterLink = await item.locator('.jobs-poster__name-link').getAttribute('href').catch(() => '');

          const description = `${title} at ${company}. Located in ${jobLocation}.`;
          const embedding = await generateEmbedding(description);
          
          const newJob = await Job.create({
            title: title.trim(),
            company: company.trim(),
            location: jobLocation.trim(),
            jobLink,
            description,
            recruiterName: recruiterName.trim(),
            recruiterProfileUrl: recruiterLink ? (recruiterLink.startsWith('http') ? recruiterLink : `https://www.linkedin.com${recruiterLink}`) : '',
            source: 'LinkedIn',
            embedding,
            status: 'New'
          });
          jobsAdded.push(newJob);
        }
      } catch (err) {
        console.warn("Skipping item:", err.message);
      }
    }
  } catch (err) {
    console.error("Deep Scan Error:", err.message);
  } finally {
    await browser.close();
  }

  return jobsAdded;
}

module.exports = {
  scrapeLinkedInJobs
};
