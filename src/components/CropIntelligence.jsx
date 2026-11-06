import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Send, 
  ArrowLeft,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function CropIntelligence({ 
  langData, 
  user, 
  setActiveTab,
  onForwardToExpert 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropHint, setCropHint] = useState('Unknown / General');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  const sampleCrops = [
    { label: "ತಿಳಿದಿಲ್ಲ / ಸಾಮಾನ್ಯ (General)", value: "Unknown / General" },
    { label: "ಟೊಮೆಟೊ (Tomato)", value: "Tomato" },
    { label: "ರಾಗಿ (Ragi / Finger Millet)", value: "Ragi" },
    { label: "ಭತ್ತ (Paddy / Rice)", value: "Paddy" },
    { label: "ಹತ್ತಿ (Cotton)", value: "Cotton" },
    { label: "ಮೆಕ್ಕೆಜೋಳ (Maize)", value: "Maize" },
    { label: "ಮೆಣಸಿನಕಾಯಿ (Chilli)", value: "Chilli" },
    { label: "ಈರುಳ್ಳಿ (Onion)", value: "Onion" }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError("ಚಿತ್ರದ ಗಾತ್ರ 8MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು (Image must be under 8MB).");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedImage) {
      setError("ದಯವಿಟ್ಟು ಬೆಳೆಯ ಎಲೆ ಅಥವಾ ಗಿಡದ ಫೋಟೋವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('kisansetu_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/crop-diagnosis', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image_base64: selectedImage,
          crop_name: cropHint,
          language: 'kn'
        })
      });

      if (!res.ok) {
        throw new Error("Diagnosis failed. Please check your image or connectivity.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("ರೋಗ ಪರೀಕ್ಷೆ ಮಾಡುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSpeech = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${result.crop_name} ಬೆಳೆಯಲ್ಲಿ ಗುರುತಿಸಲಾದ ಸಮಸ್ಯೆ: ${result.condition_name}. ಲಕ್ಷಣಗಳು: ${result.visible_symptoms}. ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು: ${result.recommended_actions}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'kn-IN';
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ಹಿಂದೆ (Dashboard)
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-kisan-700" />
            <span>{langData.actionDiagnose}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ಬೆಳೆಯ ಬಾಧಿತ ಎಲೆ, ಕಾಂಡ ಅಥವಾ ಹಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆದು ವೈಜ್ಞಾನಿಕ ಪರಿಹಾರ ಪಡೆಯಿರಿ
          </p>
        </div>

        {result && (
          <button
            onClick={toggleSpeech}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isSpeaking ? 'bg-amber-100 text-amber-800' : 'bg-kisan-50 text-kisan-800 hover:bg-kisan-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-kisan-700" />}
            <span>{isSpeaking ? langData.stopSpeak : langData.speak}</span>
          </button>
        )}
      </div>

      {/* Upload & Camera Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
        
        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ (Crop Type - Optional hint)
          </label>
          <select
            value={cropHint}
            onChange={(e) => setCropHint(e.target.value)}
            className="w-full max-w-sm px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-kisan-600 focus:outline-none"
          >
            {sampleCrops.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Image Preview / Drop area */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-kisan-500 transition-colors bg-slate-50/50">
          {selectedImage ? (
            <div className="space-y-4">
              <div className="relative inline-block max-h-72 overflow-hidden rounded-xl shadow-md border border-slate-200">
                <img 
                  src={selectedImage} 
                  alt="Crop specimen" 
                  className="max-h-72 w-auto object-contain mx-auto"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  ಮತ್ತೊಂದು ಫೋಟೋ ಬದಲಾಯಿಸಿ
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-3 py-6"
            >
              <div className="w-16 h-16 bg-kisan-100 text-kisan-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ಕ್ಯಾಮೆರಾ ಬಳಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ (JPG, PNG, WebP ಗರಿಷ್ಠ 8MB)
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleDiagnose}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow transition-all flex items-center justify-center space-x-2 ${
              !selectedImage || isAnalyzing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-kisan-700 hover:bg-kisan-800 active:scale-98'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{langData.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ರೋಗ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ (Analyze Disease)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Structured Diagnosis Result Presentation */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-md space-y-6 animate-fadeIn">
          
          {/* Top Result Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-bold text-kisan-700 uppercase tracking-wider">
                {result.crop_name} • {result.condition_type}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {result.condition_name}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                ವಿಶ್ವಾಸಾರ್ಹತೆ: {result.confidence_score}%
              </div>
            </div>
          </div>

          {/* Symptoms & Causes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>ಕಂಡುಬಂದ ಲಕ್ಷಣಗಳು (Visible Symptoms)</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {result.visible_symptoms}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>ಸಂಭಾವ್ಯ ಕಾರಣಗಳು (Possible Causes)</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {result.possible_causes}
              </p>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="text-sm font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು & ಪರಿಹಾರ (Recommended Next Steps)</span>
            </h4>
            <div className="text-xs sm:text-sm text-emerald-900 space-y-1.5 leading-relaxed whitespace-pre-line font-medium">
              {result.recommended_actions}
            </div>
          </div>

          {/* What to Avoid (Crucial Safety Prohibitions) */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>ಮಾಡಬಾರದ ತಪ್ಪುಗಳು (What to Avoid)</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              {result.what_to_avoid}
            </p>
          </div>

          {/* Source Attribution & Expert Escalation */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">ಮಾಹಿತಿ ಮೂಲ: </span>
              <span>{result.source_info}</span>
            </div>

            {/* Direct button to escalate to verified expert */}
            <button
              onClick={() => {
                if (onForwardToExpert) {
                  onForwardToExpert({
                    crop_name: result.crop_name,
                    query_text: `AI ಪರೀಕ್ಷೆಯಲ್ಲಿ '${result.condition_name}' ಗುರುತಿಸಲಾಗಿದೆ. ಖಚಿತ ಪರಿಹಾರಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.`,
                    image_base64: selectedImage
                  });
                } else {
                  setActiveTab('expert');
                }
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ಕೃಷಿ ತಜ್ಞರಿಗೆ ಕಳುಹಿಸಿ (Consult Verified Expert)</span>
            </button>
          </div>

          {/* Safety Disclaimer */}
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg text-[11px] leading-relaxed">
            {result.disclaimer}
          </div>

        </div>
      )}

    </div>
  );
}
