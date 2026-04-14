import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Settings, PenTool, ClipboardList, Send } from 'lucide-react';
import DashboardHome from './pages/DashboardHome';
import Jobs from './pages/Jobs';
import AppSettings from './pages/AppSettings';
import PostContent from './pages/PostContent';
import Tracker from './pages/Tracker';
import Outreach from './pages/Outreach';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r">
          <div className="h-20 flex items-center px-6 border-b">
            <h1 className="text-xl font-black text-blue-600 uppercase tracking-tighter">AI Job Hunter</h1>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link to="/jobs" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <Briefcase className="w-5 h-5 mr-3" /> Discovery
            </Link>
            <Link to="/outreach" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <Send className="w-5 h-5 mr-3" /> Outreach
            </Link>
            <Link to="/tracker" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Tracker
            </Link>
            <Link to="/content" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <PenTool className="w-5 h-5 mr-3" /> Content
            </Link>
            <Link to="/settings" className="flex items-center px-4 py-3 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
              <Settings className="w-5 h-5 mr-3" /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/content" element={<PostContent />} />
            <Route path="/settings" element={<AppSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
