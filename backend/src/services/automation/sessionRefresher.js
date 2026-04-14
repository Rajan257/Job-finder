const { chromium } = require('playwright');
const UserConfig = require('../../models/UserConfig');

/**
 * Opens a visible browser window to refresh the LinkedIn session.
 * Captures the 'li_at' cookie and stores it in the database.
 * @param {number} timeoutMs Max time to wait for login (defaults to 10 minutes)
 */
async function refreshLinkedInSession(timeoutMs = 600000) {
  console.log("🕒 Starting Daily LinkedIn Session Refresh (Visible Window)...");
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'] 
  }); 
  
  const context = await browser.newContext({
    viewport: null
  });
  const page = await context.newPage();

  try {
    // Navigate to LinkedIn feed or login page
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log("---------------------------------------------------------");
    console.log("ACTION REQUIRED: If you are not logged in, please log in now.");
    console.log(`Waiting up to ${timeoutMs / 60000} minutes for session...`);
    console.log("---------------------------------------------------------");

    // Indicator that we are logged in: 'Me' menu or Feed container
    const loggedInSelectors = [
      '.global-nav__me-menu-trigger',
      '.feed-identity-module',
      '#global-nav'
    ];

    let loggedIn = false;
    try {
      // Race for any of the indicators
      await Promise.race(
        loggedInSelectors.map(sel => page.waitForSelector(sel, { timeout: timeoutMs }))
      );
      loggedIn = true;
      console.log("✅ Active session detected!");
    } catch (e) {
      console.log("⚠️ Login check timed out or failed. Attempting to capture available cookies anyway.");
    }

    // Give it a second to settle
    await page.waitForTimeout(2000);

    const cookies = await context.cookies();
    const liAtCookie = cookies.find(c => c.name === 'li_at');

    if (liAtCookie) {
      console.log(`Captured Cookie: ${liAtCookie.value.substring(0, 10)}... (truncated)`);
      
      const config = await UserConfig.findOneAndUpdate(
        {}, 
        { 
          linkedinCookie: liAtCookie.value, 
          updatedAt: new Date() 
        },
        { upsert: true, new: true }
      );
      
      console.log("✅ LinkedIn session cookie successfully synchronized to database.");
    } else {
      console.error("❌ CRITICAL: 'li_at' cookie NOT FOUND. Backend operations will fail.");
    }

  } catch (err) {
    console.error("❌ Session Refresh Error:", err.message);
  } finally {
    // Small delay so the user sees the "Success" if they are looking
    await page.waitForTimeout(3000);
    await browser.close();
    console.log("🔒 Browser closed. Returning to background mode.");
  }
}

module.exports = { refreshLinkedInSession };
