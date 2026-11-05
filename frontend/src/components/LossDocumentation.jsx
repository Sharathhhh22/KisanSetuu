import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  FileText,
  RefreshCw
} from 'lucide-react';

export default function LossDocumentation({ 
  langData, 
  user, 
  setActiveTab 
}) {
  const [cropName, setCropName] = useState('Tomato');
  const [variety, setVariety] = useState('Shivani Hybrid');
  const [affectedAcres, setAffectedAcres] = useState(1.5);
  const [totalAcres, setTotalAcres] = useState(user?.land_acres || 3.0);
  const [damageCause, setDamageCause] = useState('Hailstorm / Heavy Unseasonal Rain');
  const [damageDate, setDamageDate] = useState(new Date().toISOString().split('T')[0]);
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.taluk || 'Pandavapura');
  const [village, setVillage] = useState(user?.village || 'Melukote');
  const [estLossAmount, setEstLossAmount] = useState(45000);
  
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  const damageCauses = [
    "Hailstorm / Heavy Unseasonal Rain (ಆಲಿಕಲ್ಲು / ಅಕಾಲಿಕ ಮಳೆ)",
    "Flood / Waterlogging (ನೆರೆ / ಜಲಾವೃತ)",
    "Severe Drought / Moisture Stress (ತೀವ್ರ ಬರಗಾಲ)",
    "Pest Outbreak / Locust Attack (ಕೀಟ ಬಾಧೆ / ಮಿಡತೆ ದಾಳಿ)",
    "Foliar Epidemic Blight (ರೋಗ ವ್ಯಾಪನೆ)",
    "Wild Animal Damage (ಕಾಡುಪ್ರಾಣಿ ಹಾವಳಿ)"
  ];

  const fetchReports = () => {
    const token = localStorage.getItem('kisansetu_token');
    if (!token) return;
    fetch('/api/tools/crop-loss-reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setSavedReports(d.reports || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("ಬೆಳೆ ಹಾನಿ ದಾಖಲಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ (Please login to document crop damage).");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('kisansetu_token');
      const res = await fetch('/api/tools/crop-loss-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crop_name: cropName,
          variety: variety,
          affected_acres: Number(affectedAcres),
          total_acres: Number(totalAcres),
          damage_cause: damageCause,
          damage_date: damageDate,
          location_district: district,
          location_taluk: taluk,
          location_village: village,
          estimated_loss_amount: Number(estLossAmount)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedReport({
          report_code: data.report_code,
          crop_name: cropName,
          variety: variety,
          affected_acres: affectedAcres,
          total_acres: totalAcres,
          damage_cause: damageCause,
          damage_date: damageDate,
          district: district,
          taluk: taluk,
          village: village,
          estimated_loss_amount: estLossAmount,
          farmer_name: user.name,
          farmer_phone: user.phone,
          timestamp: new Date().toLocaleString()
        });
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
            <FileSpreadsheet className="w-6 h-6 text-red-600" />
            <span>{langData.toolLoss} (Crop Loss Documentation)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ಬೆಳೆ ನಷ್ಟದ ಅಧಿಕೃತ ದಾಖಲೆ ಸೃಷ್ಟಿಸಿ ಕಂದಾಯ ಇಲಾಖೆ ಹಾಗೂ ಬೆಳೆ ವಿಮೆ (PMFBY) ಗೆ ಸಲ್ಲಿಸಿ
          </p>
        </div>
      </div>

      {/* 1. Report Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆಯ ಹೆಸರು:</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ತಳಿ (Variety):</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಹಾನಿಗೊಳಗಾದ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ):</label>
              <input
                type="number"
                step="0.1"
                required
                value={affectedAcres}
                onChange={(e) => setAffectedAcres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಒಟ್ಟು ಜಮೀನು (ಎಕರೆ):</label>
              <input
                type="number"
                step="0.1"
                required
                value={totalAcres}
                onChange={(e) => setTotalAcres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಹಾನಿಯ ದಿನಾಂಕ:</label>
              <input
                type="date"
                required
                value={damageDate}
                onChange={(e) => setDamageDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಜಿಲ್ಲೆ:</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ತಾಲೂಕು:</label>
              <input
                type="text"
                required
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಗ್ರಾಮ:</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಹಾನಿಯ ಕಾರಣ (Damage Cause):</label>
              <select
                value={damageCause}
                onChange={(e) => setDamageCause(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              >
                {damageCauses.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಅಂದಾಜು ಆರ್ಥಿಕ ನಷ್ಟ (₹):</label>
              <input
                type="number"
                value={estLossAmount}
                onChange={(e) => setEstLossAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ವರದಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>ಹಾನಿ ವರದಿ ಸೃಷ್ಟಿಸಿ (Generate Incident Report)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. Structured Printable Report Card */}
      {generatedReport && (
        <div id="printable-report" className="bg-white rounded-2xl border-2 border-slate-800 p-6 sm:p-8 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-700">
                ಕಿಸಾನ್ ಸೇತು ಅಧಿಕೃತ ಬೆಳೆ ಹಾನಿ ದಾಖಲೆ ಪತ್ರ
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                CROP DAMAGE INCIDENT REPORT
              </h3>
              <p className="text-xs text-slate-500">
                Generated via Kisan Setu Farmer Assistance System
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-white rounded-md tracking-wider">
                {generatedReport.report_code}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">{generatedReport.timestamp}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ರೈತರ ಹೆಸರು & ಸಂಪರ್ಕ:</span>
              <span className="font-bold text-slate-900">{generatedReport.farmer_name} ({generatedReport.farmer_phone})</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ಸ್ಥಳ (Location):</span>
              <span className="font-bold text-slate-900">{generatedReport.village}, {generatedReport.taluk}, {generatedReport.district}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ಬೆಳೆ & ತಳಿ:</span>
              <span className="font-bold text-slate-900">{generatedReport.crop_name} ({generatedReport.variety || "General"})</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ಹಾನಿಯ ಪ್ರಮಾಣ:</span>
              <span className="font-bold text-red-700">{generatedReport.affected_acres} ಎಕರೆ (ಒಟ್ಟು: {generatedReport.total_acres} ಎಕರೆಯಲ್ಲಿ)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ಹಾನಿಯ ಕಾರಣ & ದಿನಾಂಕ:</span>
              <span className="font-bold text-slate-900">{generatedReport.damage_cause} ({generatedReport.damage_date})</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">ಅಂದಾಜು ನಷ್ಟ ಮೌಲ್ಯ:</span>
              <span className="font-extrabold text-slate-900">₹{Number(generatedReport.estimated_loss_amount).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 max-w-md">
              ಗಮನಿಸಿ: ಈ ವರದಿಯು ರೈತರು ದಾಖಲಿಸಿದ ಸ್ವಯಂ ಘೋಷಿತ ವಿವರವಾಗಿದ್ದು, ಕಂದಾಯ ಅಧಿಕಾರಿಗಳು ಅಥವಾ ಬೆಳೆ ವಿಮಾ ಸಮೀಕ್ಷಕರು ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಡೆಸಲು ಸಹಾಯಕ ದಾಖಲೆಯಾಗಿದೆ.
            </p>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>ಮುದ್ರಿಸಿ / PDF ಡೌನ್‌ಲೋಡ್</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
