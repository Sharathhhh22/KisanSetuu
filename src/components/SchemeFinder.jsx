import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  ArrowLeft, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SchemeFinder({ 
  langData, 
  user, 
  setActiveTab 
}) {
  const [landAcres, setLandAcres] = useState(user?.land_acres || 2.5);
  const [farmerCategory, setFarmerCategory] = useState('Small / Marginal');
  const [cropType, setCropType] = useState('Any');
  const [schemesData, setSchemesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: 'Karnataka',
          land_acres: Number(landAcres),
          farmer_category: farmerCategory,
          crop_type: cropType,
          annual_income: 150000.0
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSchemesData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [landAcres, farmerCategory, cropType]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
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
            <Landmark className="w-6 h-6 text-indigo-700" />
            <span>{langData.actionSchemes}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಕೃಷಿ ಸಬ್ಸಿಡಿಗಳು ಹಾಗೂ ಅರ್ಹತೆ ಪರೀಕ್ಷಕ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full text-xs font-bold">
            ಅರ್ಹ ಯೋಜನೆಗಳು: {schemesData?.eligible_count || 0} / {schemesData?.total_count || 0}
          </span>
        </div>
      </div>

      {/* 1. Interactive Eligibility Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-kisan-700" />
          <span>ನಿಮ್ಮ ಕೃಷಿ ಮಾಹಿತಿ ನಮೂದಿಸಿ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ (Eligibility Filter)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ಒಟ್ಟು ಜಮೀನು (ಎಕರೆಗಳಲ್ಲಿ):
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kisan-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ರೈತರ ವರ್ಗ (Farmer Category):
            </label>
            <select
              value={farmerCategory}
              onChange={(e) => setFarmerCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kisan-600"
            >
              <option value="Small / Marginal">ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರು (Small & Marginal)</option>
              <option value="Medium">ಮಧ್ಯಮ ರೈತರು (Medium)</option>
              <option value="SC">ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)</option>
              <option value="ST">ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)</option>
              <option value="General">ಸಾಮಾನ್ಯ ವರ್ಗ (General)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ಮುಖ್ಯ ಬೆಳೆ (Primary Crop):
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kisan-600"
            >
              <option value="Any">ಎಲ್ಲಾ ಬೆಳೆಗಳು (Any Crop)</option>
              <option value="Millets">ಸಿರಿಧಾನ್ಯ (Ragi / Millets)</option>
              <option value="Paddy">ಭತ್ತ (Paddy)</option>
              <option value="Horticulture">ತರಕಾರಿ & ತೋಟಗಾರಿಕೆ (Vegetables)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Schemes List */}
      <div className="space-y-4">
        {schemesData?.schemes?.map((scheme) => (
          <div
            key={scheme.id}
            className={`bg-white rounded-2xl border-2 p-5 sm:p-6 shadow-sm transition-all ${
              scheme.is_user_eligible
                ? 'border-emerald-200 hover:border-emerald-400'
                : 'border-slate-200 opacity-75'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                    {scheme.category}
                  </span>
                  {scheme.is_user_eligible ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ನೀವು ಅರ್ಹರು (Eligible)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>ನಿಯಮ ಪರಿಶೀಲಿಸಿ (Review Criteria)</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {scheme.kannada_name} ({scheme.name})
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                  {scheme.benefit}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <a
                  href={scheme.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <span>ಅಧಿಕೃತ ಪೋರ್ಟಲ್</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Required Documents checklist */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು (Required Documents):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {scheme.required_documents?.map((doc, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with verification date and source */}
            <div className="mt-3 pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>ಮೂಲ: {scheme.source}</span>
              <span>ಕೊನೆಯ ಪರಿಶೀಲನೆ: {scheme.last_verified_date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-xl text-slate-600 text-xs leading-relaxed border border-slate-200">
        <ShieldCheck className="w-4 h-4 text-slate-500 inline mr-1.5" />
        {schemesData?.disclaimer}
      </div>

    </div>
  );
}
