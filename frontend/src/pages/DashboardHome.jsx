import React, { useState, useEffect } from 'react';
import { jobService } from '../services/apiService';

function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, applied: 0, topMatch: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await jobService.getJobs();
        const applied = data.filter(j => j.status === 'Applied').length;
        const matches = data.map(j => j.matchScore || 0);
        const top = matches.length > 0 ? Math.max(...matches) : 0;
        setStats({ total: data.length, applied, topMatch: top });
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-4">Opportunities Found</h2>
          <p className="text-5xl font-black text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-4">Auto-Applied</h2>
          <p className="text-5xl font-black text-primary-600">{stats.applied}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-4">Highest Match</h2>
          <p className="text-5xl font-black text-green-600">{stats.topMatch}%</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            Run Scraper Now
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
            Trigger Autonomous Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
