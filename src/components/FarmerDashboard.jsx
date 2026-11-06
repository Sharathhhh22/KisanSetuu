import React from 'react';
import { 
  Camera, 
  CloudSun, 
  TrendingUp, 
  MessageSquare, 
  Landmark, 
  ShieldAlert, 
  FileSpreadsheet, 
  Calculator, 
  Users, 
  BookOpen, 
  Mic, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';

export default function FarmerDashboard({ 
  langData, 
  setActiveTab, 
  user, 
  weatherData, 
  mandiData,
  onOpenAuth 
}) {
  const primaryActions = [
    {
      id: 'crop-ai',
      title: langData.actionDiagnose,
      desc: langData.actionDiagnoseDesc,
      icon: Camera,
      badge: "AI Vision (ಐಸಿಎಆರ್)",
      color: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 text-emerald-900",
      iconBg: "bg-emerald-600 text-white"
    },
    {
      id: 'weather',
      title: langData.actionWeather,
      desc: langData.actionWeatherDesc,
      icon: CloudSun,
      badge: "ಲೈವ್ ಹವಾಮಾನ",
      color: "border-sky-200 hover:border-sky-500 bg-sky-50/40 text-sky-900",
      iconBg: "bg-sky-600 text-white"
    },
    {
      id: 'mandi',
      title: langData.actionMandi,
      desc: langData.actionMandiDesc,
      icon: TrendingUp,
      badge: "APMC Mandi",
      color: "border-amber-200 hover:border-amber-500 bg-amber-50/40 text-amber-900",
      iconBg: "bg-amber-600 text-white"
    },
    {
      id: 'chat',
      title: langData.actionChat,
      desc: langData.actionChatDesc,
      icon: MessageSquare,
      badge: "ಧ್ವನಿ & ಪ್ರಶ್ನೆ",
      color: "border-green-200 hover:border-green-500 bg-green-50/40 text-green-900",
      iconBg: "bg-green-700 text-white"
    },
    {
      id: 'schemes',
      title: langData.actionSchemes,
      desc: langData.actionSchemesDesc,
      icon: Landmark,
      badge: "ಸಬ್ಸಿಡಿ & ವಿಮೆ",
      color: "border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 text-indigo-900",
      iconBg: "bg-indigo-600 text-white"
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* 1. Welcoming Farmer Hero Banner */}
      <section className="bg-gradient-to-r from-kisan-800 via-kisan-700 to-kisan-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold text-green-100 mb-3">
            <MapPin className="w-3.5 h-3.5 text-yellow-300" />
            <span>{user?.district ? `${user.district}, Karnataka` : 'Mandya, Karnataka'}</span>
            <span className="opacity-40">•</span>
            <span>{new Date().toLocaleDateString('kn-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
            {user ? (
              <span>ನಮಸ್ಕಾರ, {user.name}</span>
            ) : (
              <span>ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! (Welcome to Kisan Setu)</span>
            )}
          </h1>

          <p className="text-sm sm:text-base text-green-100/90 mb-5 leading-relaxed">
            ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ, ನಿಖರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಮಂಡಿ ಧಾರಣೆಗಳು ಹಾಗೂ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸುಲಭವಾಗಿ ಪಡೆದುಕೊಳ್ಳಿ.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('crop-ai')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-sm rounded-xl shadow transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4 text-slate-900" />
              <span>{langData.actionDiagnose}</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-xl backdrop-blur transition-colors"
            >
              <Mic className="w-4 h-4 text-green-200" />
              <span>ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ (Voice Query)</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <div className="w-72 h-72 rounded-full border-[20px] border-white" />
        </div>
      </section>

      {/* 2. FIVE PRIMARY ACTIONS (Section 4 Compliance) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ಮುಖ್ಯ ಸೇವೆಗಳು (Primary Farmer Services)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ದೈನಂದಿನ ಕೃಷಿ ನಿರ್ಧಾರಗಳಿಗಾಗಿ ಕೆಳಗಿನ 5 ಪ್ರಮುಖ ಸೇವೆಗಳನ್ನು ಬಳಸಿ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {primaryActions.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={() => setActiveTab(act.id)}
                className={`relative group rounded-2xl border-2 p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] flex flex-col justify-between ${act.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow ${act.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                      {act.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 tracking-tight">
                    {act.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                    {act.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold">
                  <span>ತೆರೆಯಿರಿ (Open)</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Real-Time Glance: Weather & Mandi Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Weather Snapshot Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CloudSun className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ (Weather Snapshot)</h3>
            </div>
            <button 
              onClick={() => setActiveTab('weather')}
              className="text-xs font-semibold text-kisan-700 hover:text-kisan-800"
            >
              ಪೂರ್ಣ ವರದಿ &rarr;
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-sky-50/60 rounded-xl mb-4 border border-sky-100">
            <div>
              <p className="text-xs text-sky-800 font-medium">ಸ್ಥಳ: {weatherData?.location || 'Mandya, Karnataka'}</p>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {weatherData?.current?.temperature_c || '28.5'}°C
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{weatherData?.current?.condition || 'ಭಾಗಶಃ ಮೋಡ'}</p>
            </div>
            <div className="text-right text-xs space-y-1 text-slate-600">
              <div>ಗಾಳಿ: <strong>{weatherData?.current?.wind_speed_kmh || '8.5'} km/h</strong></div>
              <div>ತೇವಾಂಶ: <strong>{weatherData?.current?.humidity_pct || '65'}%</strong></div>
              <div>ಮಳೆ ಸಂಭವ: <strong>{weatherData?.daily_7d?.[0]?.rain_prob || '10'}%</strong></div>
            </div>
          </div>

          {/* Real-time agro advisory highlight */}
          {weatherData?.agro_recommendations?.[0] && (
            <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-emerald-50 text-emerald-900 text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>{weatherData.agro_recommendations[0].title}:</strong> {weatherData.agro_recommendations[0].message}
              </div>
            </div>
          )}
        </div>

        {/* Mandi Snapshot Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">ಇಂದಿನ ಪ್ರಮುಖ ಮಂಡಿ ಧಾರಣೆ (Mandi Live Prices)</h3>
            </div>
            <button 
              onClick={() => setActiveTab('mandi')}
              className="text-xs font-semibold text-kisan-700 hover:text-kisan-800"
            >
              ಎಲ್ಲಾ ಬೆಲೆಗಳು &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { crop: "ರಾಗಿ (Ragi)", market: "Mandya APMC", price: "₹3,350 / ಕ್ವಿಂಟಾಲ್", change: "+₹60", up: true },
              { crop: "ಟೊಮೆಟೊ (Tomato)", market: "Kolar APMC Yard", price: "₹1,850 / ಕ್ವಿಂಟಾಲ್", change: "+₹180", up: true },
              { crop: "ಭತ್ತ (Sona Masoori)", market: "Raichur APMC", price: "₹2,620 / ಕ್ವಿಂಟಾಲ್", change: "+₹40", up: true }
            ].map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{m.crop}</h4>
                  <p className="text-xs text-slate-500">{m.market}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">{m.price}</span>
                  <div className={`text-[11px] font-semibold ${m.up ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {m.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Specialized Agricultural Tools (Unique Differentiators) */}
      <section className="bg-slate-100/70 rounded-2xl p-5 sm:p-6 border border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          ವಿಶೇಷ ಕೃಷಿ ಸಾಧನಗಳು (Specialized Farmer Tools)
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ ತೀರ್ಮಾನ, ಬೆಳೆ ಹಾನಿ ದಾಖಲೆ ಮತ್ತು ನಿವ್ವಳ ಲಾಭ ಲೆಕ್ಕಾಚಾರ
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('spray')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <ShieldAlert className="w-6 h-6 text-emerald-700 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolSpray}</span>
            <span className="text-[10px] text-slate-500 mt-1">ಹವಾಮಾನ ಆಧರಿತ</span>
          </button>

          <button
            onClick={() => setActiveTab('loss')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <FileSpreadsheet className="w-6 h-6 text-red-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolLoss}</span>
            <span className="text-[10px] text-slate-500 mt-1">ವಿಮೆ ವರದಿ</span>
          </button>

          <button
            onClick={() => setActiveTab('profit')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <Calculator className="w-6 h-6 text-indigo-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolProfit}</span>
            <span className="text-[10px] text-slate-500 mt-1">ನಿವ್ವಳ ಆದಾಯ</span>
          </button>

          <button
            onClick={() => setActiveTab('expert')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolExpert}</span>
            <span className="text-[10px] text-slate-500 mt-1">ವಿಜ್ಞಾನಿಗಳ ಸಂಪರ್ಕ</span>
          </button>

          <button
            onClick={() => setActiveTab('diary')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <BookOpen className="w-6 h-6 text-teal-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolDiary}</span>
            <span className="text-[10px] text-slate-500 mt-1">ಹೊಲದ ಇತಿಹಾಸ</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-kisan-500 shadow-2xs hover:shadow transition-all"
          >
            <Users className="w-6 h-6 text-amber-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">{langData.toolCommunity}</span>
            <span className="text-[10px] text-slate-500 mt-1">ರೈತ ಅನುಭವ</span>
          </button>
        </div>
      </section>

    </div>
  );
}
