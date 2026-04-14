import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const jobService = {
    getJobs: async () => {
        const response = await api.get('/jobs');
        return response.data;
    },
    runCrawler: async (keyword, location, autonomousMode = false) => {
        const response = await api.post('/jobs/search', { keyword, location, autonomousMode });
        return response.data;
    },
    updateJobStatus: async (id, statusData) => {
        const response = await api.patch(`/jobs/${id}`, statusData);
        return response.data;
    },
    generateOutreach: async (jobId) => {
        const response = await api.post('/outreach/generate', { jobId });
        return response.data;
    },
    addApplication: async (appData) => {
        const response = await api.post('/applications', appData);
        return response.data;
    }
};

export const profileService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },
    updateProfile: async (profileData) => {
        const response = await api.post('/profile', profileData);
        return response.data;
    },
    saveAPIKeys: async (keys) => {
        const response = await api.post('/settings/api-keys', keys);
        return response.data;
    }
};

export const aiService = {
    generateContent: async (topic) => {
        const response = await api.post('/content/generate', { topic });
        return response.data;
    },
    scheduleContent: async (content, scheduledAt, mediaFile) => {
        const response = await api.post('/content/schedule', { content, scheduledAt, mediaFile });
        return response.data;
    },
    getPostHistory: async () => {
        const response = await api.get('/content/history');
        return response.data;
    },
    deletePost: async (id) => {
        const response = await api.delete(`/content/history/${id}`);
        return response.data;
    }
};

export default api;
