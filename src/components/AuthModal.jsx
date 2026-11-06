import React, { useState } from 'react';
import { X, User, Phone, Lock, Sprout, ShieldCheck, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('farmer');
  const [district, setDistrict] = useState('Mandya');
  const [taluk, setTaluk] = useState('Pandavapura');
  const [village, setVillage] = useState('Melukote');
  const [landAcres, setLandAcres] = useState(2.5);
  const [soilType, setSoilType] = useState('Red Sandy Loam');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? {
      phone: phone.trim(),
      password,
      name: name.trim(),
      role,
      district,
      taluk,
      village,
      land_acres: Number(landAcres),
      soil_type: soilType
    } : {
      phone: phone.trim(),
      password
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      localStorage.setItem('kisansetu_token', data.token);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickPhone, quickPwd) => {
    setPhone(quickPhone);
    setPassword(quickPwd);
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-kisan-100 text-kisan-800 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {isRegister ? 'ಕಿಸಾನ್ ಸೇತು ನೋಂದಣಿ (Register)' : 'ರೈತರ ಲಾಗಿನ್ (Farmer Login)'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ನಿಮ್ಮ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಇತಿಹಾಸವನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಲು ಲಾಗಿನ್ ಆಗಿ
          </p>
        </div>

        {/* Quick Demo Logins for instant evaluation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            ತ್ವರಿತ ಪರೀಕ್ಷಾ ಖಾತೆಗಳು (Quick Demo Login):
          </span>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('9845012345', 'Farmer@123')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-kisan-600 rounded text-xs font-semibold text-slate-800"
            >
              ರೈತ (Farmer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('9880112233', 'Expert@Kisan2026')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-600 rounded text-xs font-semibold text-blue-800"
            >
              ತಜ್ಞ (Expert)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('9999900000', 'Admin@KisanSetu2026')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-purple-600 rounded text-xs font-semibold text-purple-800"
            >
              ಆಡಳಿತ (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ರೈತರ ಹೆಸರು (Full Name):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ಉದಾ: ನಿಂಗೇ ಗೌಡ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಪಾತ್ರ (Role):</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  >
                    <option value="farmer">ರೈತ (Farmer)</option>
                    <option value="expert">ಕೃಷಿ ತಜ್ಞ (Agri Expert)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಜಮೀನು (ಎಕರೆ):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={landAcres}
                    onChange={(e) => setLandAcres(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಜಿಲ್ಲೆ:</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ತಾಲೂಕು:</label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone Number):</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile number"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ಪಾಸ್‌ವರ್ಡ್ (Password):</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-kisan-700 hover:bg-kisan-800 text-white font-bold text-sm rounded-xl shadow transition-all"
          >
            {isLoading ? 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...' : (isRegister ? 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ (Register)' : 'ಲಾಗಿನ್ ಆಗಿ (Login)')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-xs font-semibold text-kisan-700 hover:text-kisan-900"
          >
            {isRegister ? 'ಖಾತೆ ಈಗಾಗಲೇ ಇದೆಯೇ? ಲಾಗಿನ್ ಆಗಿ' : 'ಹೊಸ ಖಾತೆ ತೆರೆಯಬೇಕೆ? ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ'}
          </button>
        </div>
      </div>
    </div>
  );
}
