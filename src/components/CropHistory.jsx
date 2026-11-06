import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Layers, 
  Droplet, 
  ArrowLeft,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';

export default function CropHistory({ 
  langData, 
  user, 
  onUpdateUser, 
  setActiveTab 
}) {
  const [crops, setCrops] = useState([]);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [cropName, setCropName] = useState('Ragi (Finger Millet)');
  const [variety, setVariety] = useState('ML-365');
  const [sowingDate, setSowingDate] = useState('2026-08-15');
  const [acreage, setAcreage] = useState(2.0);
  const [stage, setStage] = useState('Vegetative');
  const [soilNotes, setSoilNotes] = useState('');
  
  // Farm Memory Profile state
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.taluk || 'Pandavapura');
  const [village, setVillage] = useState(user?.village || 'Melukote');
  const [landAcres, setLandAcres] = useState(user?.land_acres || 3.5);
  const [soilType, setSoilType] = useState(user?.soil_type || 'Red Sandy Loam');
  const [irrigationType, setIrrigationType] = useState(user?.irrigation_type || 'Borewell & Canal');
  const [profileMsg, setProfileMsg] = useState(null);

  const fetchCrops = () => {
    const token = localStorage.getItem('kisansetu_token');
    if (!token) return;
    fetch('/api/farm-crops', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setCrops(d.crops || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCrops();
  }, [user]);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('kisansetu_token');
    try {
      const res = await fetch('/api/farm-crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crop_name: cropName,
          variety: variety,
          sowing_date: sowingDate,
          acreage: Number(acreage),
          growth_stage: stage,
          soil_health_notes: soilNotes
        })
      });
      if (res.ok) {
        setShowAddCrop(false);
        fetchCrops();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCrop = async (id) => {
    const token = localStorage.getItem('kisansetu_token');
    try {
      const res = await fetch(`/api/farm-crops/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCrops(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('kisansetu_token');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          district,
          taluk,
          village,
          land_acres: Number(landAcres),
          soil_type: soilType,
          irrigation_type: irrigationType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProfileMsg("ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಮೆಮೊರಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ (Smart Farm Memory Saved).");
        if (onUpdateUser) onUpdateUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
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
            <BookOpen className="w-6 h-6 text-teal-700" />
            <span>{langData.toolDiary} (Field Diary & Smart Farm Memory)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ನಿಮ್ಮ ಹೊಲದ ಬೆಳೆಗಳ ಇತಿಹಾಸ, ಬಿತ್ತನೆ ವಿವರ ಮತ್ತು ವೈಯಕ್ತಿಕ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ನಿರ್ವಹಿಸಿ
          </p>
        </div>
      </div>

      {/* 1. Smart Farm Memory (Farmer Profile) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-kisan-700" />
          <span>ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಮೆಮೊರಿ (Smart Farm Agricultural Profile)</span>
        </h3>
        <p className="text-xs text-slate-500">
          ಈ ಮಾಹಿತಿಯನ್ನು ಆಧರಿಸಿ ಕಿಸಾನ್ AI ಸಹಾಯಕ ನಿಮಗೆ ಸೂಕ್ತವಾದ, ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ ಸಲಹೆಗಳನ್ನು ನೀಡುತ್ತದೆ.
        </p>

        {profileMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಜಿಲ್ಲೆ:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ತಾಲೂಕು:</label>
              <input
                type="text"
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಗ್ರಾಮ:</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಒಟ್ಟು ಜಮೀನು (ಎಕರೆ):</label>
              <input
                type="number"
                step="0.5"
                value={landAcres}
                onChange={(e) => setLandAcres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಮಣ್ಣಿನ ಪ್ರಕಾರ (Soil Type):</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              >
                <option value="Red Sandy Loam">ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು (Red Sandy Loam)</option>
                <option value="Black Cotton Soil">ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (Black Cotton Soil)</option>
                <option value="Clay Loam">ಜೇಡಿ ಮಣ್ಣು (Clay Loam)</option>
                <option value="Laterite Soil">ಲ್ಯಾಟರೈಟ್ / ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ:</label>
              <input
                type="text"
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                placeholder="ಬೋರ್‌ವೆಲ್, ಕಾಲುವೆ, ಮಳೆಯಾಶ್ರಿತ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-kisan-700 hover:bg-kisan-800 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>ಮೆಮೊರಿ ಉಳಿಸಿ (Save Farm Memory)</span>
          </button>
        </form>
      </div>

      {/* 2. Field Diary: Active Crops Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ಬೆಳೆ ಆರೋಗ್ಯ ಡೈರಿ (Active Crops in Field)
            </h3>
            <p className="text-xs text-slate-500">ಬಿತ್ತನೆ ದಿನಾಂಕ, ಬೆಳವಣಿಗೆಯ ಹಂತ ಮತ್ತು ಮಣ್ಣಿನ ಆರೈಕೆ ಟಿಪ್ಪಣಿಗಳು</p>
          </div>
          <button
            onClick={() => setShowAddCrop(true)}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ</span>
          </button>
        </div>

        {crops.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ. ಮೇಲೆ 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.
          </p>
        ) : (
          <div className="space-y-3">
            {crops.map((c) => (
              <div 
                key={c.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-slate-900">{c.crop_name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                      {c.growth_stage}
                    </span>
                    <span className="text-xs text-slate-500">• {c.acreage} ಎಕರೆ</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ತಳಿ: <strong>{c.variety || "General"}</strong> • ಬಿತ್ತನೆ ದಿನಾಂಕ: <strong>{c.sowing_date}</strong>
                  </p>
                  {c.soil_health_notes && (
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                      ಆರೈಕೆ ಟಿಪ್ಪಣಿ: {c.soil_health_notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteCrop(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">ಹೊಸ ಬೆಳೆ ನೋಂದಣಿ</h3>

            <form onSubmit={handleAddCrop} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆಯ ಹೆಸರು:</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ತಳಿ (Variety):</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಬಿತ್ತನೆ ದಿನಾಂಕ:</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ವಿಸ್ತೀರ್ಣ (ಎಕರೆ):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳವಣಿಗೆಯ ಹಂತ (Stage):</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Sowing / Germination">ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ (Germination)</option>
                  <option value="Vegetative">ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ (Vegetative)</option>
                  <option value="Flowering">ಹೂವಾಡುವ ಹಂತ (Flowering)</option>
                  <option value="Pod / Fruit Setting">ಕಾಯಿ / ತೆನೆ ಕಟ್ಟುವಿಕೆ (Fruit Setting)</option>
                  <option value="Maturity / Harvest">ಕೊಯ್ಲು ಹಂತ (Maturity)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಮಣ್ಣಿನ ಆರೋಗ್ಯ & ಗೊಬ್ಬರ ಟಿಪ್ಪಣಿ:</label>
                <input
                  type="text"
                  value={soilNotes}
                  onChange={(e) => setSoilNotes(e.target.value)}
                  placeholder="ಉದಾ: ಟ್ರೈಕೋಡರ್ಮ ಬೀಜೋಪಚಾರ, 19:19:19 ಗೊಬ್ಬರ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCrop(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  ಡೈರಿಗೆ ಸೇರಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
