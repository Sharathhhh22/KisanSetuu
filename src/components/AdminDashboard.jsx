import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  FileSpreadsheet, 
  Activity, 
  ArrowLeft,
  Award,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard({ 
  langData, 
  user, 
  setActiveTab 
}) {
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('kisansetu_token');
    if (!token) return;
    try {
      const [resOverview, resUsers] = await Promise.all([
        fetch('/api/admin/overview', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resOverview.ok && resUsers.ok) {
        setOverview(await resOverview.json());
        const u = await resUsers.json();
        setUsersList(u.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyExpert = async (expertId) => {
    const token = localStorage.getItem('kisansetu_token');
    try {
      const res = await fetch(`/api/admin/verify-expert/${expertId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
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
            <ShieldCheck className="w-6 h-6 text-purple-700" />
            <span>ಕಿಸಾನ್ ಸೇತು ಆಡಳಿತ ಕನ್ಸೋಲ್ (Admin Dashboard)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ರೈತರ ಖಾತೆಗಳು, ಕೃಷಿ ವಿಜ್ಞಾನಿಗಳ ಪ್ರಮಾಣೀಕರಣ ಮತ್ತು ವೇದಿಕೆ ವಿಶ್ಲೇಷಣೆ
          </p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">ನೋಂದಾಯಿತ ರೈತರು</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{overview.total_farmers}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">ಕೃಷಿ ತಜ್ಞರು</span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{overview.total_experts}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">AI ರೋಗ ಪರೀಕ್ಷೆಗಳು</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{overview.total_diagnoses}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">ಬಾಕಿ ಪ್ರಶ್ನೆಗಳು</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{overview.pending_expert_queries}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">ಬೆಳೆ ಹಾನಿ ದಾಖಲೆಗಳು</span>
            <span className="text-2xl font-extrabold text-red-600 mt-1 block">{overview.total_loss_reports}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">ರೈತ ಸಮುದಾಯ ಚರ್ಚೆ</span>
            <span className="text-2xl font-extrabold text-purple-700 mt-1 block">{overview.total_community_posts}</span>
          </div>
        </div>
      )}

      {/* Users & Experts Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            ಬಳಕೆದಾರರು & ತಜ್ಞರ ನಿರ್ವಹಣೆ (Users & Verified Experts)
          </h3>
          <span className="text-xs text-slate-500 font-medium">ಒಟ್ಟು: {usersList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ಹೆಸರು & ಮೊಬೈಲ್</th>
                <th className="py-3 px-4">ಪಾತ್ರ (Role)</th>
                <th className="py-3 px-4">ಜಿಲ್ಲೆ & ತಾಲೂಕು</th>
                <th className="py-3 px-4">ಸ್ಥಿತಿ / ಬ್ಯಾಡ್ಜ್</th>
                <th className="py-3 px-4 text-right">ಕ್ರಮ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : u.role === 'expert' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.district || 'Mandya'} ({u.taluk || 'Pandavapura'})
                  </td>
                  <td className="py-3 px-4">
                    {u.role === 'expert' ? (
                      u.is_verified_expert === 1 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified Expert</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold">Unverified</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">Regular Farmer</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role === 'expert' && u.is_verified_expert === 0 && (
                      <button
                        onClick={() => handleVerifyExpert(u.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
                      >
                        ಪ್ರಮಾಣೀಕರಿಸಿ (Verify)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
