const mongoose = require('mongoose');
const UserProfile = require('./src/models/UserProfile');
const { generateEmbedding } = require('./src/services/ai/gemini');
require('dotenv').config();

async function seedProfile() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linkedin_bot';
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Seeding...");

    const resumeText = `
      Name: Rajan Rai
      Email: rajanbhatt257@gmail.com
      Github: Rajan257
      Education:
      - Bachelor of Technology (Computer Science Engineering), Babu Banarasi Das University (2023-2027), GPA: 7.52
      - Intermediate - PCM, Shri Vishwanath Inter College (2020-2022), 72.4%
      - High School - Science, Shri Vishwanath Inter College (2018-2020), 74.83%
      
      Skills Summary:
      - Languages: Java, Python, C, JavaScript, SQL
      - Frameworks & Libraries: Node.js, Express.js, Flask, OpenCV
      - Web Technologies: HTML, CSS, React.js, REST APIs, JSON
      - Databases: MySQL, MongoDB, SQLite
      - Core CS: Data Structures & Algorithms, OOP, DBMS, OS, Networking, System Design
      - AI & Tools: Machine Learning Basics, Speech Recognition, NLP, Git, GitHub, Postman, Linux
      
      Projects:
      - Smart Irrigation System using IoT integrated with AI: Developed an intelligent irrigation system using IoT sensors and AI-based prediction models. Tech: Python, Arduino, IoT Sensors, Machine Learning, ThingSpeak Cloud.
      - Fake News Detection using Machine Learning: Built an NLP model to classify news as real or fake. Tech: Python, Scikit-learn, Pandas, NLP, Flask.
      - Jarvis Voice Assistant - AI Desktop Automation System: Voice-controlled AI assistant for desktop tasks. Tech: Python, SpeechRecognition, pyttsx3, OpenAI APIs.
      - Unified EV Energy Payment & Billing Network: Ongoing MERN stack project for EV charging provider platform. Tech: MERN Stack, Node.js, Express, MongoDB, React.js.
      - [NEW] Currently working on advanced Full Stack and AI projects to further enhance automation systems.
      
      Honors and Awards: NSS Volunteer, Multiple-Time Speech & Public Speaking Winner.
      Volunteer Experience: AI Research Centre (AIRC) Student Research Volunteer.
    `;

    console.log("Generating identity embedding for Rajan Rai...");
    let resumeEmbedding = [];
    try {
        // Try to generate embedding if API key is present
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            resumeEmbedding = await generateEmbedding(resumeText);
        } else {
            console.log("Skipping embedding generation (Placeholder key detected).");
        }
    } catch (e) {
        console.warn("Could not generate embedding:", e.message);
    }

    const profileData = {
      name: "Rajan Rai",
      email: "rajanbhatt257@gmail.com",
      githubProfile: "https://github.com/Rajan257",
      education: "B.Tech in Computer Science (2023-2027)",
      skills: ["Java", "Python", "JavaScript", "Node.js", "React.js", "Express.js", "Flask", "OpenCV", "Machine Learning", "NLP", "MongoDB", "SQL", "IoT"],
      projects: [
        "Smart Irrigation System", 
        "Fake News Detection", 
        "Jarvis Voice Assistant", 
        "Unified EV Energy Payment Network",
        "Autonomous AI Development Projects"
      ],
      resumeText: resumeText,
      resumeEmbedding: resumeEmbedding
    };

    const profile = await UserProfile.findOneAndUpdate({}, profileData, { upsert: true, new: true });
    console.log("Profile Seeded Successfully for:", profile.name);
    process.exit(0);
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
}

seedProfile();
