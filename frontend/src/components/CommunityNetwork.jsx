import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ThumbsUp, 
  MessageCircle, 
  CheckCircle, 
  Send, 
  ArrowLeft, 
  Plus, 
  Award,
  Filter,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function CommunityNetwork({ 
  langData, 
  user, 
  setActiveTab 
}) {
  const [posts, setPosts] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCropTag, setNewCropTag] = useState('Tomato');
  const [newBody, setNewBody] = useState('');
  const [replyBody, setReplyBody] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const crops = ["All", "Tomato", "Ragi", "Paddy", "Cotton", "Maize", "Chilli", "Onion"];

  const fetchPosts = () => {
    fetch(`/api/community/posts?crop=${selectedCrop}`)
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCrop]);

  const handleUpvote = async (postId) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/upvote`, { method: 'POST' });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("ಪ್ರಶ್ನೆ ಅಥವಾ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ (Please login).");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('kisansetu_token');
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crop_tag: newCropTag,
          title: newTitle,
          body: newBody
        })
      });
      if (res.ok) {
        setShowNewModal(false);
        setNewTitle('');
        setNewBody('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (postId) => {
    const text = replyBody[postId]?.trim();
    if (!text) return;
    if (!user) {
      alert("ಉತ್ತರಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ (Please login to reply).");
      return;
    }

    try {
      const token = localStorage.getItem('kisansetu_token');
      const res = await fetch(`/api/community/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: text })
      });
      if (res.ok) {
        setReplyBody(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ಹಿಂದೆ (Dashboard)
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            <span>{langData.toolCommunity} (Farmer Community Network)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ರೈತರ ನಡುವೆ ನೈಜ ಕೃಷಿ ಅನುಭವಗಳು, ಬೆಳೆ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಪರಿಹಾರಗಳ ವಿನಿಮಯ ವೇದಿಕೆ
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-kisan-700 hover:bg-kisan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ಪ್ರಶ್ನೆ / ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ</span>
        </button>
      </div>

      {/* Crop Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {crops.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCrop(c)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCrop === c
                ? 'bg-kisan-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                  {post.author_name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{post.author_name}</h4>
                  <span className="text-[10px] text-slate-400">{post.author_role}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                {post.crop_tag}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {post.body}
            </p>

            {/* Action Bar */}
            <div className="flex items-center space-x-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button
                onClick={() => handleUpvote(post.id)}
                className="flex items-center space-x-1 hover:text-emerald-700 font-medium"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>ಉಪಯುಕ್ತ ({post.upvotes})</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>ಉತ್ತರಗಳು ({post.replies?.length || 0})</span>
              </div>
            </div>

            {/* Replies Thread */}
            {post.replies?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-xl">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="text-xs space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-800">{reply.author_name}</span>
                      {reply.is_expert_answer === 1 && (
                        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Expert Answer</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{reply.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="ನಿಮ್ಮ ಸಲಹೆ ಅಥವಾ ಅನುಭವ ಬರೆಯಿರಿ..."
                value={replyBody[post.id] || ''}
                onChange={(e) => setReplyBody({ ...replyBody, [post.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply(post.id)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-kisan-600"
              />
              <button
                onClick={() => handleSendReply(post.id)}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              ಹೊಸ ಪ್ರಶ್ನೆ / ಕೃಷಿ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆ:</label>
                <select
                  value={newCropTag}
                  onChange={(e) => setNewCropTag(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  {crops.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ವಿಷಯ / ಶೀರ್ಷಿಕೆ:</label>
                <input
                  type="text"
                  required
                  placeholder="ಉದಾ: ಮುರುಟು ರೋಗಕ್ಕೆ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ ಅನುಭವ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ವಿವರಣೆ:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="ನಿಮ್ಮ ಕೃಷಿ ಪದ್ಧತಿ, ಖರ್ಚು ಉಳಿತಾಯ ಅಥವಾ ರೋಗ ನಿಯಂತ್ರಣ ವಿವರ ಹಂಚಿಕೊಳ್ಳಿ..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-kisan-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  ಪ್ರಕಟಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
