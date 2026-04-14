const { generateText } = require('../ai/gemini');

/**
 * Generate a LinkedIn post based on recent activities or interests
 * @param {string} topic e.g., 'Learning React Context API', 'Completed an internship project'
 * @returns {string} The drafted post
 */
async function generateLinkedInPost(topic) {
  const prompt = `
    Act as a professional software developer on LinkedIn.
    Write a highly engaging, authentic, and concise LinkedIn post about: "${topic}".
    The tone should be enthusiastic but professional.
    Include 2-3 relevant hashtags at the end. Do not use overly formal or robotic language.
  `;
  try {
    const post = await generateText(prompt);
    return post;
  } catch (error) {
    console.error("Error generating post", error);
    return "";
  }
}

/**
 * Generate a personalized HR outreach message
 * @param {string} hrName 
 * @param {string} company 
 * @param {string} role 
 * @returns {string} The drafted message
 */
async function generateHROutreach(hrName, company, role) {
  const prompt = `
    Write a short, professional LinkedIn connection request message (under 300 characters) 
    to a recruiter named ${hrName} at ${company} expressing interest in the ${role} position.
  `;
  try {
    const message = await generateText(prompt);
    return message;
  } catch (error) {
    console.error("Error generating HR outreach", error);
    return "";
  }
}

module.exports = {
  generateLinkedInPost,
  generateHROutreach
};
