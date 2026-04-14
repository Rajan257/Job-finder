import React, { useState, useEffect } from 'react';
import { profileService } from '../services/apiService';

function AppSettings() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    githubProfile: '',
    education: '',
    projects: '',
    skills: '',
    resumeText: ''
  });

  const [keys, setKeys] = useState({
    geminiApiKey: '',
    linkedinCookie: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        if (data.name) {
          setProfile({
            ...data,
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills,
            projects: Array.isArray(data.projects) ? data.projects.join(', ') : data.projects
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const savedProfile = await profileService.updateProfile(profile);
      setProfile({
        ...savedProfile,
        skills: Array.isArray(savedProfile.skills) ? savedProfile.skills.join(', ') : savedProfile.skills,
        projects: Array.isArray(savedProfile.projects) ? savedProfile.projects.join(', ') : savedProfile.projects
      });
      alert("Career Profile updated successfully!");
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save profile.");
    }
  };

  const handleSaveKeys = async () => {
    try {
      await profileService.saveAPIKeys(keys);
      alert("Settings saved. API keys updated across the system.");
    } catch (err) {
      console.error("API update error", err);
      alert("Failed to update API keys.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse text-2xl">Loading Bot Configuration...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Bot Intelligence Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Configure your target profile and connection proxies.</p>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Career Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 space-y-8 overflow-hidden relative">
          <div className="bg-primary-600/5 absolute top-0 left-0 right-0 h-1" />
          <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary-600 pl-4">Candidate Knowledge Base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Rajan"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                placeholder="rajan@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Education</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={profile.education}
                onChange={(e) => setProfile({...profile, education: e.target.value})}
                placeholder="B.Tech in Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">GitHub Identifier</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={profile.githubProfile}
                onChange={(e) => setProfile({...profile, githubProfile: e.target.value})}
                placeholder="rajan257"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Resume Extraction & Project Context</label>
            <textarea 
              className="w-full h-48 bg-gray-50 border-none rounded-2xl p-6 font-mono text-sm text-gray-700 focus:ring-2 focus:ring-primary-500"
              value={profile.resumeText}
              onChange={(e) => setProfile({...profile, resumeText: e.target.value})}
              placeholder="Paste your full resume here for AI matching..."
            />
          </div>

          <button 
            onClick={handleSaveProfile}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 font-black transition shadow-xl shadow-primary-200"
          >
            Save Profile & Update Knowledge Base
          </button>
        </div>

        {/* API & Secrets Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 space-y-8 overflow-hidden relative">
          <div className="bg-orange-600/5 absolute top-0 left-0 right-0 h-1" />
          <h2 className="text-xl font-black text-gray-900 border-l-4 border-orange-600 pl-4">Connection Credentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Google Gemini API KEY</label>
              <input 
                type="password" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={keys.geminiApiKey}
                onChange={(e) => setKeys({...keys, geminiApiKey: e.target.value})}
                placeholder="AIzaSyXXXXXXXXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">LinkedIn li_at Cookie</label>
              <input 
                type="password" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                value={keys.linkedinCookie}
                onChange={(e) => setKeys({...keys, linkedinCookie: e.target.value})}
                placeholder="AQEDXXXXXXXXXXXXXXX"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveKeys}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 font-black transition shadow-xl shadow-orange-100"
          >
            Authenticate Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppSettings;
