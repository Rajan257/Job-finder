import React, { useState, useEffect } from 'react';
import { jobService } from '../services/apiService';
import { Send, Copy, User, Building, BadgeCheck } from 'lucide-react';

function Outreach() {
  const [outreachJobs, setOutreachJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutreach = async () => {
      try {
        const data = await jobService.getJobs();
        // Filter for jobs that have a generated outreach message
        setOutreachJobs(data.filter(j => j.outreachMessage));
      } catch (err) {
        console.error("Outreach Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutreach();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
  };

  const handleMarkSent = async (jobId) => {
    try {
      await jobService.updateJobStatus(jobId, { status: 'Applied' });
      setOutreachJobs(outreachJobs.filter(j => j._id !== jobId));
      alert("Job marked as 'Applied' and moved to Tracker!");
    } catch (err) {
      console.error("Status Update Failed", err);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold">Loading Pitches...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Recruiter Outreach</h1>
          <p className="text-gray-500 mt-1">High-match roles with AI-generated personalized pitches.</p>
        </div>
        <div className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl font-bold text-sm border border-primary-100 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5"/> {outreachJobs.length} Ready to Send
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {outreachJobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium text-lg">No high-match jobs found yet. High-match &gt; 85%.</p>
          </div>
        ) : outreachJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            {/* Job Summary Sidebar */}
            <div className="md:w-1/3 bg-gray-50/50 p-8 border-r border-gray-100">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest mb-4">
                <Building className="w-4 h-4"/> Targeting Role
              </div>
              <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">{job.title}</h2>
              <p className="text-primary-600 font-bold mb-6">{job.company}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-1">Match Score</label>
                  <span className="text-3xl font-black text-green-600">{job.matchScore}%</span>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-1">Recruiter</label>
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <User className="w-4 h-4 text-gray-400"/> {job.recruiterName}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Message Area */}
            <div className="flex-1 p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Personalized AI Pitch</h3>
                <button 
                   onClick={() => handleCopy(job.outreachMessage)}
                   className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition"
                >
                  <Copy className="w-5 h-5"/>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 font-sans text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {job.outreachMessage}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => handleCopy(job.outreachMessage)}
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-700 transition shadow-lg shadow-primary-200"
                >
                  <Copy className="w-5 h-5"/> Copy Text
                </button>
                <a 
                  href={job.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition"
                >
                  <Send className="w-5 h-5"/> Visit Job Page
                </a>
                <button 
                  onClick={() => handleMarkSent(job._id)}
                  className="px-6 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition shadow-lg shadow-green-100"
                >
                  <BadgeCheck className="w-5 h-5"/> Mark Applied
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Outreach;
