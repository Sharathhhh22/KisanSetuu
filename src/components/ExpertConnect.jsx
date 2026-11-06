import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Send, 
  MessageSquare, 
  Clock, 
  ArrowLeft, 
  AlertCircle,
  Award,
  RefreshCw
} from 'lucide-react';

export default function ExpertConnect({ 
  langData, 
  user, 
  initialQuery, 
  setActiveTab 
}) {
  const [experts, setExperts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [cropName, setCropName] = useState(initialQuery?.crop_name || '');
  const [queryText, setQueryText] = useState(initialQuery?.query_text || '');
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertReplyText, setExpertReplyText] = useState('');
  const [answeringId, setAnsweringId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchExperts = () => {
    fetch('/api/experts')
      .then(r => r.json())
      .then(d => setExperts(d.experts || []))
      .catch(err => console.error(err));
  };

  const fetchConsultations = () => {
    const token = localStorage.getItem('kisansetu_token');
    if (!token) return;
    fetch('/api/experts/consultations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setConsultations(d.consultations || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchExperts();
    fetchConsultations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ (Please login to consult an expert).");
      return;
    }

    if (!cropName.trim() || !queryText.trim()) {
      alert("ದಯವಿಟ್ಟು ಬೆಳೆಯ ಹೆಸರು ಮತ್ತು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('kisansetu_token');
      const res = await fetch('/api/experts/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          expert_id: selectedExpertId ? Number(selectedExpertId) : null,
          crop_name: cropName,
          district: district,
          query_text: queryText
        })
      });

      if (res.ok) {
        setSuccessMsg("ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಅಧಿಕೃತ ಕೃಷಿ ವಿಜ್ಞಾನಿಗಳಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ. ಶೀಘ್ರದಲ್ಲಿಯೇ ಉತ್ತರ ಲಭ್ಯವಾಗಲಿದೆ.");
        setCropName('');
        setQueryText('');
        fetchConsultations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (consultId) => {
    if (!expertReplyText.trim()) return;
    const token = localStorage.getItem('kisansetu_token');
    try {
      const res = await fetch(`/api/experts/consultations/${consultId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ expert_response: expertReplyText })
      });
      if (res.ok) {
        setAnsweringId(null);
        setExpertReplyText('');
        fetchConsultations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ಹಿಂದೆ (Dashboard)
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-kisan-700" />
            <span>{langData.toolExpert}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ಐಸಿಎಆರ್, ಕೆವಿಕೆ ಮತ್ತು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಪ್ರಮಾಣೀಕೃತ ವಿಜ್ಞಾನಿಗಳ ನೇರ ಸಂಪರ್ಕ
          </p>
        </div>
      </div>

      {/* 1. Verified Agricultural Experts Directory */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿ ವಿಜ್ಞಾನಿಗಳು (Verified Agricultural Officers & Scientists)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experts.map((exp) => (
            <div 
              key={exp.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-kisan-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    {exp.name.slice(3, 5).toUpperCase()}
                  </div>
                  {exp.is_verified_expert === 1 && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900">{exp.name}</h4>
                <p className="text-xs text-blue-700 font-semibold">{exp.expert_title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {exp.expert_specialization}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>ಕಾರ್ಯವ್ಯಾಪ್ತಿ: {exp.district}, {exp.taluk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Submit Consultation Query Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-kisan-700" />
          <span>ಕೃಷಿ ತಜ್ಞರಿಗೆ ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ (Submit Consultation Query)</span>
        </h3>

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆಯ ಹೆಸರು (Crop Name):</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="ಉದಾ: ಟೊಮೆಟೊ, ರಾಗಿ, ಭತ್ತ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kisan-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಜಿಲ್ಲೆ (District):</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kisan-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ನಿರ್ದಿಷ್ಟ ತಜ್ಞರು (ಯಾವುದಾದರೂ):</label>
              <select
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kisan-600"
              >
                <option value="">ಯಾವುದಾದರೂ ಲಭ್ಯವಿರುವ ತಜ್ಞರು (Any)</option>
                {experts.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.district})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ಸಮಸ್ಯೆಯ ವಿವರಣೆ (Describe Symptom / Query):</label>
            <textarea
              required
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="ಎಲೆಯ ಬಣ್ಣ ಬದಲಾವಣೆ, ಕೀಟ ಬಾಧೆ ಅಥವಾ ಗೊಬ್ಬರದ ಪ್ರಮಾಣದ ಕುರಿತು ವಿವರವಾಗಿ ಬರೆಯಿರಿ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kisan-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-kisan-700 hover:bg-kisan-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ಸಲಹೆಗಾಗಿ ಸಲ್ಲಿಸಿ (Submit Query)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 3. Query Status Tracker & Responses */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <span>ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳ ಸ್ಥಿತಿ & ತಜ್ಞರ ಉತ್ತರಗಳು (Query Status & Scientific Answers)</span>
        </h3>

        {consultations.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ (No consultation queries recorded yet).
          </p>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => (
              <div 
                key={c.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    ಬೆಳೆ: {c.crop_name} • {c.district}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    c.status === 'answered' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status === 'answered' ? 'ಉತ್ತರಿಸಲಾಗಿದೆ (Answered)' : 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Review)'}
                  </span>
                </div>

                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  {c.query_text}
                </p>

                {/* Expert verified answer if available */}
                {c.expert_response && (
                  <div className="mt-2 p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                      <Award className="w-4 h-4 text-emerald-700" />
                      <span>{c.expert_name || "ಅಧಿಕೃತ ಕೃಷಿ ತಜ್ಞರು"} ರವರ ಉತ್ತರ:</span>
                    </div>
                    <p className="text-emerald-950 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {c.expert_response}
                    </p>
                  </div>
                )}

                {/* If user is an expert or admin, provide answer box */}
                {user?.role in { expert: 1, admin: 1 } && c.status !== 'answered' && (
                  <div className="mt-3 pt-2 border-t border-slate-200 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="ವಿಜ್ಞಾನಿಗಳ ಶಿಫಾರಸು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
                      value={answeringId === c.id ? expertReplyText : ''}
                      onChange={(e) => {
                        setAnsweringId(c.id);
                        setExpertReplyText(e.target.value);
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => handleAnswerSubmit(c.id)}
                      className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-bold"
                    >
                      ಉತ್ತರ ಪ್ರಕಟಿಸಿ (Publish Answer)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
