require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', require('./routes/api'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LinkedIn Bot Backend Running' });
});

// Start Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
  
  // PRE-LOAD CONFIGS INTO ENVIRONMENT
  const UserConfig = require('./models/UserConfig');
  const initialConfig = await UserConfig.findOne();
  if (initialConfig) {
    if (initialConfig.geminiApiKey) process.env.GEMINI_API_KEY = initialConfig.geminiApiKey;
    if (initialConfig.linkedinCookie) process.env.LINKEDIN_SESSION_COOKIE = initialConfig.linkedinCookie;
    console.log("Environment configurations loaded from Database.");
  }

  // Initialization of scheduler 
  require('./scheduler/index');

  // TRIGGER INITIAL CRAWL IMMEDIATELY FOR RUN-OFF
  try {
    const { scrapeLinkedInJobs } = require('./services/scraper/linkedin');
    const UserConfig = require('./models/UserConfig');
    const config = await UserConfig.findOne();
    const cookie = config ? config.linkedinCookie : null;
    
    console.log("Triggering initial discovery crawl...");
    scrapeLinkedInJobs('Software Intern', 'Remote', cookie).catch(err => console.error("Initial crawl failed:", err.message));
  } catch (err) {
    console.error("Initial crawl setup failed:", err.message);
  }
});
