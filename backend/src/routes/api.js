const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Profile Routes
router.get('/profile', apiController.getProfile);
router.post('/profile', apiController.updateProfile);

// Job Routes
router.get('/jobs', apiController.getJobs);
router.post('/jobs/search', apiController.searchJobs); // Trigger live crawler
router.patch('/jobs/:id', apiController.updateJobStatus);

// Outreach Routes
router.post('/outreach/generate', apiController.generateOutreach);

// Content Generation
router.post('/content/generate', apiController.generatePost);
router.post('/content/schedule', apiController.schedulePost);
router.get('/content/history', apiController.getScheduledPosts);
router.delete('/content/history/:id', apiController.deleteScheduledPost);

// Manual Application Tracking
router.post('/applications', apiController.createApplication);

// Settings & Config
router.post('/settings/resume', apiController.updateProfile); // Reusing existing profile update
router.post('/settings/api-keys', apiController.updateAPIKeys);

module.exports = router;
