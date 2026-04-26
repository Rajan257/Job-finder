const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Helper to get a configured Gemini model, ensuring the API key is current.
 */
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Please set it in Settings.");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

function getEmbeddingModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Please set it in Settings.");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

/**
 * Generate a text response using Gemini
 * @param {string} prompt 
 * @returns {string} generated text
 */
async function generateText(prompt) {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn("Gemini API Error (Using fallback text):", error.message);
    
    // If it's a LinkedIn post generation prompt, return a nice mock post
    if (prompt.includes("LinkedIn post about:")) {
        const topicMatch = prompt.match(/about:\s*(.*?)\./);
        const topic = topicMatch ? topicMatch[1].trim() : "my recent work";
        const hashtag = topic.replace(/\s+/g, '');
        return `🚀 Just conquered another milestone! I've been diving deep into ${topic} recently and the learning curve has been incredible.\n\nHere are my top takeaways:\n1️⃣ The ecosystem is constantly evolving, which keeps things exciting.\n2️⃣ Solving complex problems requires breaking them down into manageable pieces.\n3️⃣ Consistency is key to mastering new skills.\n\nExcited to see where this journey takes me next! What are you currently learning? Let's connect and grow together! 🌟\n\n#CareerGrowth #Technology #LearningJourney #${hashtag}`;
    }
    
    return "This is a fallback generated text because the Gemini API key was invalid. Please update it in the Settings page.";
  }
}

/**
 * Generate embeddings for text
 * @param {string} text 
 * @returns {number[]} Array of numbers representing the embedding
 */
async function generateEmbedding(text) {
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Embedding Error (Ignored):", error.message);
    return []; // Return empty array to avoid failing job creation
  }
}

/**
 * Extract structured details from a job description
 * @param {string} description 
 * @returns {object} Extracted skills, tech, experience, and summary
 */
async function analyzeJobDescription(description) {
  const prompt = `
    Analyze the following job description and extract information in a strict JSON format.
    Required fields:
    - extractedSkills: (array of strings) Core skills like "React", "Node.js", "Problem Solving".
    - experienceLevel: (string) e.g., "Entry Level", "Junior", "Mid-level", "Senior", "Internship".
    - technologies: (array of strings) Specific tech stack mentioned.
    - summary: (string) A concise 2-sentence summary of the role.

    Job Description:
    """${description}"""

    Return ONLY the JSON object.
  `;
  try {
    const rawResult = await generateText(prompt);
    // Find JSON in markdown blocks if Gemini wraps it
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(rawResult);
  } catch (error) {
    console.error("Analysis Error:", error);
    return { extractedSkills: [], experienceLevel: "Unknown", technologies: [], summary: "Failed to parse summary." };
  }
}

/**
 * Generate a personalized recruiter outreach message
 * @param {object} job 
 * @param {object} profile 
 * @returns {string} Personalized message
 */
async function generateOutreachMessage(job, profile) {
  const prompt = `
    You are an AI assistant helping a candidate, Rajan Rai, draft a recruiter message.
    Candidate Profile:
    - Name: Rajan Rai
    - Education: B.Tech Computer Science
    - Skills: Java, Spring Boot, MERN stack (MongoDB, Express, React, Node.js)
    - Additional Strength: Data Structures and Algorithms

    Job Details:
    - Title: ${job.title}
    - Company: ${job.company}
    - Recruiter Name: ${job.recruiterName || 'Hiring Manager'}

    Draft a personalized recruiter outreach message using one of these templates that fits the role best.
    
    BEST OVERALL:
    "Hello {Name}, I hope you're doing well. I recently came across the {JobTitle} opportunity at {Company} and wanted to express my interest..."
    
    If the role is very tech-heavy, use TECHNICAL FOCUS:
    "Hello {Name}, I hope you’re doing well. I recently noticed the {JobTitle} role at {Company}..."
    
    Choose the best one and replace the placeholders. Return ONLY the message text.
  `;
  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("Outreach Gen Error:", error);
    return `Hello ${job.recruiterName || 'Hiring Manager'},\n\nI hope you're doing well. I recently saw the ${job.title} opening at ${job.company} and wanted to express my interest. I have experience in Java, Spring Boot, and MERN stack.\n\nBest,\nRajan Rai`;
  }
}

module.exports = {
  generateText,
  generateEmbedding,
  analyzeJobDescription,
  generateOutreachMessage
};
