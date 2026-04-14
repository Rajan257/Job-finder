import React, { useState, useEffect } from 'react';
import { aiService } from '../services/apiService';
import { Send, Copy, Sparkles, Calendar, Paperclip, Image as ImageIcon, X, Trash2, Clock, CheckCircle, AlertCircle, List } from 'lucide-react';

function PostContent() {
  const [activeTab, setActiveTab] = useState('writer'); // 'writer' or 'history'
  
  // Writer States
  const [topic, setTopic] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFile, setMediaFile] = useState(null);

  // History States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await aiService.getPostHistory();
      setHistory(data);
    } catch (err) {
      console.error("History Error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/cancel this post?")) return;
    try {
      await aiService.deletePost(id);
      setHistory(history.filter(p => p._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const generatePost = async () => {
    if (!topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const { post } = await aiService.generateContent(topic);
      setGeneratedPost(post);
    } catch (err) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    alert("Copied to clipboard!");
  };

  const handleConfirmSchedule = async () => {
    if (!scheduledTime) return alert("Please select a date and time");
    try {
      await aiService.scheduleContent(generatedPost, scheduledTime, mediaFile);
      alert(`Success! Post scheduled for ${new Date(scheduledTime).toLocaleString()}`);
      setShowScheduler(false);
      setGeneratedPost('');
      setTopic('');
    } catch (err) {
      alert("Scheduling failed: " + err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Lab</h1>
        
        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex gap-1">
          <button 
            onClick={() => setActiveTab('writer')}
            className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'writer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Sparkles className="w-4 h-4"/> Writer
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4"/> History
          </button>
        </div>
      </div>
      
      {activeTab === 'writer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4">Draft New Update</h2>
            <textarea 
              className="w-full h-48 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 mb-4 font-medium text-gray-700"
              placeholder="What did you learn today or complete? (e.g. Completed a new React project)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button 
              onClick={generatePost}
              disabled={loading}
              className={`w-full py-5 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-2xl font-black mt-4 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-100 text-lg`}
            >
              {loading ? 'Generating Post...' : <><Sparkles className="w-5 h-5"/> Generate with AI</>}
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4">Post Strategy</h2>
            {generatedPost ? (
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-800 whitespace-pre-wrap border border-gray-100 font-medium leading-relaxed">
                {generatedPost}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-400 italic h-48 flex items-center justify-center border border-gray-100">
                AI will draft your strategy here.
              </div>
            )}
            
            {generatedPost && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <button 
                    onClick={handleCopy}
                    className="flex-1 py-4 border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 font-bold transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5"/> Copy Text
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="file" 
                      id="media-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="media-upload"
                      className="w-full py-4 border-2 border-blue-100 text-blue-600 rounded-2xl hover:bg-blue-50 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5"/> {mediaFile ? 'Change Media' : 'Add Image / Cert'}
                    </label>
                  </div>
                </div>

                {mediaFile && (
                  <div className="relative rounded-2xl overflow-hidden border border-blue-100 group">
                    <img src={mediaFile} alt="Preview" className="w-full h-48 object-cover" />
                    <button 
                      onClick={() => setMediaFile(null)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => setShowScheduler(!showScheduler)}
                  className={`w-full py-4 ${showScheduler ? 'bg-orange-600' : 'bg-indigo-600'} text-white rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg`}
                >
                  <Send className="w-5 h-5"/> {showScheduler ? 'Cancel' : 'Schedule Automated Post'}
                </button>
              </div>
            )}

            {showScheduler && (
              <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-black text-blue-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5"/> Select Target Time
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="datetime-local" 
                    className="flex-1 p-4 bg-white border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                  <button 
                    onClick={handleConfirmSchedule}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                  >
                    Confirm Queue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          {historyLoading ? (
            <div className="text-center py-20 font-bold text-gray-400">Loading History...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 font-bold text-gray-400">
              No posts scheduled or sent yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((post) => (
                <div key={post._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    {getStatusIcon(post.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate mb-1">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs font-black uppercase text-gray-400 tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(post.scheduledAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1">{post.status}</span>
                    </div>
                  </div>
                  {post.mediaFile && (
                    <img src={post.mediaFile} className="w-16 h-12 rounded-xl object-cover border border-gray-100" />
                  )}
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="p-4 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PostContent;
