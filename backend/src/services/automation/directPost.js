const { chromium } = require('playwright');
const UserConfig = require('../../models/UserConfig');
const fs = require('fs');
const path = require('path');

async function directPostToLinkedIn(content, mediaBase64) {
  console.log("🚀 Executing Scheduled Post...");
  
  const config = await UserConfig.findOne();
  if (!config || !config.linkedinCookie) {
    throw new Error("No LinkedIn Cookie found in settings. Cannot post.");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  await context.addCookies([{
    name: 'li_at',
    value: config.linkedinCookie,
    domain: '.www.linkedin.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  }]);

  const page = await context.newPage();

  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const startPostBtn = page.locator('button:has-text("Start a post")');
    await startPostBtn.waitFor({ state: 'visible', timeout: 15000 });
    await startPostBtn.click();
    
    // Handle Media Upload if provided
    if (mediaBase64) {
      console.log("📸 Uploading media...");
      const tempPath = path.join(__dirname, `temp_media_${Date.now()}.png`);
      const base64Data = mediaBase64.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(tempPath, base64Data, 'base64');

      try {
        // LinkedIn's media input is often a hidden input[type="file"]
        await page.waitForSelector('input[type="file"]', { timeout: 10000 });
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempPath);
        
        // Wait for the media to process (usually an "Add" or "Next" button appears)
        await page.waitForTimeout(3000); 
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }

    await page.waitForSelector('.ql-editor', { state: 'visible' });
    const editor = page.locator('.ql-editor');
    await editor.fill(content);
    
    const postBtn = page.locator('button:has-text("Post")');
    await postBtn.click();
    
    console.log("✅ Post successfully published to LinkedIn!");
    return true;
  } catch (err) {
    console.error("❌ Playwright Post Error:", err.message);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = { directPostToLinkedIn };
