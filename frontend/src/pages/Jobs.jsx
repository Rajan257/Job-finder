import React, { useState, useEffect } from 'react';
import { jobService } from '../services/apiService';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('Software Engineer Intern');
  const [locationQuery, setLocationQuery] = useState('Remote');
  const [autonomousMode, setAutonomousMode] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs();
      setJobs(data.filter(j => j.status === 'New' || j.status === 'Saved'));
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = async () => {
    setCrawling(true);
    setCrawlStatus('Initializing Autonomous Bot...');
    try {
      // Progress simulation based on mode
      setTimeout(() => setCrawlStatus('Authenticating & Injecting Session...'), 2000);
      setTimeout(() => setCrawlStatus('Searching in Background (Headless)...'), 6000);
      
      if (autonomousMode) {
        setTimeout(() => setCrawlStatus('Background Auto-Apply Sequence Active...'), 12000);
        setTimeout(() => setCrawlStatus('Background HR Outreach Initiated...'), 20000);
      } else {
        setTimeout(() => setCrawlStatus('Extracting & Analyzing Job Data...'), 12000);
      }

      await jobService.runCrawler(searchQuery, locationQuery, autonomousMode);
      await fetchJobs(); 
    } catch (err) {
      alert("Crawl failed: " + err.message);
    } finally {
      setCrawling(false);
      setCrawlStatus('');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobService.updateJobStatus(jobId, { status: 'Applied' });
      setJobs(jobs.filter(j => j._id !== jobId));
      alert("Application status updated to 'Applied'!");
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleOutreach = async (job) => {
    try {
      if (job.outreachMessage) {
        setOutreachMessage(job.outreachMessage);
      } else {
        const { message } = await jobService.generateOutreach(job._id);
        setOutreachMessage(message);
      }
    } catch (err) {
      console.error("Outreach Generation Failed", err);
    }
  };

  if (loading && !crawling) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse text-2xl">Scanning LinkedIn for New Opportunities...</div>;

  return (
    <div className="p-8">
      {/* Search Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-[2] space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Target Keyword</label>
          <input 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Software Engineer Intern"
          />
        </div>
        <div className="flex-[2] space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Location</label>
          <input 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="e.g. Remote or San Francisco"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
           <button 
             onClick={() => setAutonomousMode(!autonomousMode)}
             className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${autonomousMode ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' : 'bg-gray-50 text-gray-400 border-2 border-gray-100'}`}
           >
             {autonomousMode ? '⚡ Full Auto On' : '⚡ Full Auto Off'}
           </button>
           <button 
             onClick={handleSearch}
             disabled={crawling}
             className={`w-full py-4 ${crawling ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-2xl font-black transition shadow-lg shadow-blue-200`}
           >
             {crawling ? 'Running...' : 'Search Jobs'}
           </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">24/7 Job Discovery</h1>
        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
           {crawling ? 'Live Crawl in Progress' : 'Monitoring Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {crawling ? (
           <div className="text-center py-24 bg-blue-50/30 rounded-[3rem] border-2 border-dashed border-blue-100 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 animate-bounce">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <h3 className="text-3xl font-black text-blue-900 mb-2">{crawlStatus}</h3>
             <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">Background AI Engine is searching and applying anonymously</p>
           </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 font-bold text-gray-400">
             <div className="text-4xl mb-4 opacity-10">🔍</div>
             No new jobs found. Try a different keyword or check your settings.
          </div>
        ) : jobs.map((job, idx) => (
          <div key={job._id || idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h2>
                <div className="flex items-center gap-2 overflow-hidden">
                  <p className="text-blue-600 font-black tracking-tight">{job.company}</p>
                  <span className="text-gray-300 font-black">•</span>
                  <p className="text-gray-500 font-bold truncate">{job.location}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                <span className={`text-2xl font-black ${job.matchScore > 80 ? 'text-green-600' : 'text-blue-600'}`}>
                  {job.matchScore || '--'}%
                </span>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1">Match Score</p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
              <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
                 {job.summary || "AI is still analyzing this job description..."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(job.technologies || []).slice(0, 5).map(t => (
                <span key={t} className="px-4 py-1.5 bg-white text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 shadow-sm group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                  {t}
                </span>
              ))}
              {job.experienceLevel && (
                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                  {job.experienceLevel}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 pt-8 border-t border-gray-50">
              <a 
                href={job.jobLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-200 transition"
              >
                View on LinkedIn
              </a>
              <button 
                onClick={() => handleApply(job._id)}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-100"
              >
                Mark as Applied
              </button>
              <button 
                onClick={() => handleOutreach(job)}
                className="px-8 py-4 border-2 border-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:border-blue-200 hover:text-blue-600 transition"
              >
                Draft Pitch
              </button>
            </div>
          </div>
        ))}
      </div>

      {outreachMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Recruiter Outreach Message</h3>
            <textarea 
              className="w-full h-48 p-4 border border-gray-200 rounded-xl font-sans text-gray-700 mb-6 focus:ring-2 focus:ring-primary-500"
              value={outreachMessage}
              readOnly
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setOutreachMessage('')}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button 
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
                onClick={() => {
                  navigator.clipboard.writeText(outreachMessage);
                  alert("Copied to clipboard!");
                }}
              >
                Copy & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
