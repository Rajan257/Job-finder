import React, { useState, useEffect } from 'react';
import { jobService } from '../services/apiService';
import { CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

function Tracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({ title: '', company: '', status: 'Applied', jobLink: '' });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs();
      setApplications(data.filter(j => j.status !== 'New' && j.status !== 'Saved'));
    } catch (err) {
      console.error("Tracker Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await jobService.updateJobStatus(jobId, { status: newStatus });
      await fetchApplications(); // Refresh list
    } catch (err) {
      console.error("Update Failed", err);
    }
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      await jobService.addApplication(newApp);
      setShowAddModal(false);
      setNewApp({ title: '', company: '', status: 'Applied', jobLink: '' });
      await fetchApplications();
    } catch (err) {
      alert("Failed to add application");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Interview': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-8 text-center animate-bounce font-bold">Loading History...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Application Tracker</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          Add Application
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-blue-600 mb-2 font-bold uppercase text-xs tracking-widest">
             <Clock className="w-4 h-4"/> Applied
           </div>
           <p className="text-3xl font-black">{applications.filter(a => a.status === 'Applied').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-yellow-600 mb-2 font-bold uppercase text-xs tracking-widest">
             <Calendar className="w-4 h-4"/> Interviews
           </div>
           <p className="text-3xl font-black">{applications.filter(a => a.status === 'Interview').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-widest">Job & Company</th>
              <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-widest">Date Applied</th>
              <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-widest text-center">Match</th>
              <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-widest">Status</th>
              <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-widest text-right">Update</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
               <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400">No active applications tracked yet. Start applying!</td></tr>
            ) : applications.map((app) => (
              <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-6 py-6 font-bold text-gray-900">
                   {app.title}
                   <p className="text-xs font-medium text-blue-600 mt-1">{app.company}</p>
                </td>
                <td className="px-6 py-6 text-sm text-gray-500 font-medium">
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Manual'}
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="font-bold text-gray-400">{app.matchScore || '--'}%</span>
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                  <select 
                    value={app.status} 
                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    className="bg-gray-50 border-none rounded-lg text-xs font-bold text-gray-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer">Offer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleAddApplication}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-4"
          >
            <h3 className="text-2xl font-black mb-6">Add Manual Application</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Title</label>
              <input 
                required
                className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-gray-700"
                value={newApp.title}
                onChange={(e) => setNewApp({...newApp, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Company</label>
              <input 
                required
                className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-gray-700"
                value={newApp.company}
                onChange={(e) => setNewApp({...newApp, company: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Status</label>
                <select 
                  className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-gray-700"
                  value={newApp.status}
                  onChange={(e) => setNewApp({...newApp, status: e.target.value})}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Location</label>
                <input 
                  className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-gray-700"
                  value={newApp.location}
                  onChange={(e) => setNewApp({...newApp, location: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Tracker;
