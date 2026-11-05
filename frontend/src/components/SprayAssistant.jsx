import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  Droplets, 
  Wind, 
  Thermometer, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function SprayAssistant({ 
  langData, 
  weatherData, 
  setActiveTab 
}) {
  const [cropName, setCropName] = useState('Tomato');
  const [targetPest, setTargetPest] = useState('Whitefly / Leaf Curl');
  const [chemicalName, setChemicalName] = useState('Neem Oil 10,000 ppm / Bio-formulation');
  const [temperature, setTemperature] = useState(weatherData?.current?.temperature_c || 28.0);
  const [rainProb, setRainProb] = useState(weatherData?.daily_7d?.[0]?.rain_prob || 10.0);
  const [windSpeed, setWindSpeed] = useState(weatherData?.current?.wind_speed_kmh || 8.5);
  const [decision, setDecision] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/tools/spray-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: cropName,
          target_pest_or_disease: targetPest,
          chemical_or_formulation: chemicalName,
          temperature_c: Number(temperature),
          rain_probability_pct: Number(rainProb),
          wind_speed_kmh: Number(windSpeed)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDecision(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          ಹಿಂದೆ (Dashboard)
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-emerald-700" />
          <span>{langData.toolSpray} (Before You Spray)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ಹವಾಮಾನ, ಮಳೆ ಸಾಧ್ಯತೆ ಮತ್ತು ಗಾಳಿಯ ವೇಗವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸುರಕ್ಷಿತ ಸಿಂಪಡಣೆ ತೀರ್ಮಾನ ಕೈಗೊಳ್ಳಿ
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆಯ ಹೆಸರು:</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kisan-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಕೀಟ / ರೋಗದ ಗುರಿ:</label>
              <input
                type="text"
                required
                value={targetPest}
                onChange={(e) => setTargetPest(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kisan-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಔಷಧ / ಜೈವಿಕ ಮಿಶ್ರಣ:</label>
              <input
                type="text"
                required
                value={chemicalName}
                onChange={(e) => setChemicalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kisan-600"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-red-500" />
                ತಾಪಮಾನ (°C):
              </label>
              <input
                type="number"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                ಮಳೆಯ ಸಂಭವ (%):
              </label>
              <input
                type="number"
                step="1"
                value={rainProb}
                onChange={(e) => setRainProb(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-600" />
                ಗಾಳಿಯ ವೇಗ (km/h):
              </label>
              <input
                type="number"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="px-6 py-2.5 bg-kisan-700 hover:bg-kisan-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center space-x-2"
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ಸಿಂಪಡಣೆ ಸಾಧ್ಯತೆ ಪರಿಶೀಲಿಸಿ (Evaluate Spraying)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Decision Output */}
      {decision && (
        <div className={`rounded-2xl border-2 p-6 shadow-md space-y-5 animate-fadeIn ${
          decision.recommendation === 'GO' 
            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
            : decision.recommendation === 'CAUTION_DELAY'
            ? 'bg-amber-50/70 border-amber-400 text-amber-950'
            : 'bg-red-50/70 border-red-400 text-red-950'
        }`}>
          <div className="flex items-center space-x-3">
            {decision.recommendation === 'GO' && <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />}
            {decision.recommendation === 'CAUTION_DELAY' && <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />}
            {decision.recommendation === 'DO_NOT_SPRAY' && <XCircle className="w-8 h-8 text-red-600 shrink-0" />}
            <div>
              <h3 className="text-xl font-extrabold uppercase tracking-tight">
                {decision.recommendation === 'GO' && 'ಸಿಂಪಡಣೆ ಕೈಗೊಳ್ಳಬಹುದು (GO FOR SPRAY)'}
                {decision.recommendation === 'CAUTION_DELAY' && 'ಎಚ್ಚರಿಕೆ - ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ (CAUTION - DELAY SPRAY)'}
                {decision.recommendation === 'DO_NOT_SPRAY' && 'ಸಿಂಪಡಿಸಬೇಡಿ - ಅಪಾಯಕಾರಿ (DO NOT SPRAY)'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold mt-0.5 leading-relaxed">
                {decision.reason}
              </p>
            </div>
          </div>

          {/* Safety Gear Checklist */}
          <div className="bg-white/80 rounded-xl p-4 border border-black/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              ರೈತರ ಸುರಕ್ಷತಾ ಕವಚ (Mandatory Safety Gear):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {decision.safety_gear_checklist?.map((gear, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{gear}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CIBRC Safety Warnings */}
          <div className="bg-white/80 rounded-xl p-4 border border-black/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              ಕೀಟನಾಶಕ ಮಂಡಳಿ (CIBRC) ನಿಯಮಗಳು:
            </h4>
            <div className="space-y-1 text-xs text-slate-700">
              {decision.cibrc_safety_warnings?.map((w, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            {decision.disclaimer}
          </p>
        </div>
      )}

    </div>
  );
}
