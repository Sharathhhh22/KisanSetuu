import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function WeatherIntelligence({ 
  langData, 
  weatherData, 
  setWeatherData, 
  setActiveTab 
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('mandya');
  const [isLoading, setIsLoading] = useState(false);
  const [districtsList, setDistrictsList] = useState([]);

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(d => setDistrictsList(d.districts || []))
      .catch(err => console.error(err));
  }, []);

  const handleDistrictChange = async (distId) => {
    setSelectedDistrict(distId);
    setIsLoading(true);
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: distId, language: 'kn' })
      });
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const current = weatherData?.current || {
    temperature_c: 28.5,
    humidity_pct: 64,
    precipitation_mm: 0.0,
    wind_speed_kmh: 8.5,
    condition: "Partly Cloudy",
    updated_at: "Live"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header & Location Selector */}
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
            <CloudSun className="w-6 h-6 text-sky-600" />
            <span>{langData.actionWeather}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ನಿಜಾವಧಿಯ ಹವಾಮಾನ, 24-ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ ಹಾಗೂ ಕೃಷಿ ಸಿಂಪಡಣೆ ಮಾರ್ಗಸೂಚಿ
          </p>
        </div>

        {/* District Selector */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-kisan-700 shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-kisan-600 focus:outline-none shadow-2xs"
          >
            {districtsList.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {isLoading && <RefreshCw className="w-4 h-4 text-kisan-600 animate-spin" />}
        </div>
      </div>

      {/* 1. Main Current Weather Card */}
      <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold text-sky-100 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{weatherData?.location || 'Mandya, Karnataka'}</span>
            </div>
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight mt-1">
              {current.temperature_c}°C
            </div>
            <p className="text-base sm:text-lg text-sky-100 mt-1 font-medium">
              {current.condition}
            </p>
            <p className="text-xs text-sky-200 mt-2">
              ಕೊನೆಯ ನವೀಕರಣ: {current.updated_at} (Open-Meteo High Resolution)
            </p>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 border border-white/10">
              <Droplets className="w-5 h-5 mx-auto mb-1 text-sky-200" />
              <div className="text-lg sm:text-xl font-bold">{current.humidity_pct}%</div>
              <div className="text-[11px] text-sky-200">ತೇವಾಂಶ (Humidity)</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 border border-white/10">
              <Wind className="w-5 h-5 mx-auto mb-1 text-sky-200" />
              <div className="text-lg sm:text-xl font-bold">{current.wind_speed_kmh} <span className="text-xs">km/h</span></div>
              <div className="text-[11px] text-sky-200">ಗಾಳಿ (Wind)</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 border border-white/10">
              <CloudRain className="w-5 h-5 mx-auto mb-1 text-sky-200" />
              <div className="text-lg sm:text-xl font-bold">{current.precipitation_mm} <span className="text-xs">mm</span></div>
              <div className="text-[11px] text-sky-200">ಮಳೆ (Precipitation)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Agricultural Advisories Generated from Weather */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-kisan-700" />
          <span>ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆಗಳು (Agro-Meteorological Advisories)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherData?.agro_recommendations?.map((adv, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border flex items-start space-x-3 ${
                adv.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : adv.type === 'danger'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {adv.type === 'warning' || adv.type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{adv.title}</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{adv.message}</p>
                <p className="text-[11px] opacity-75 mt-1">{adv.en_message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 24-Hour Hourly Forecast */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">ಮುಂದಿನ 24 ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ (24-Hour Hourly Forecast)</h3>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {weatherData?.hourly_24h?.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[85px] text-center shrink-0"
            >
              <span className="text-xs text-slate-500 font-semibold">{h.time}</span>
              <CloudSun className="w-5 h-5 text-sky-600 my-2" />
              <span className="text-sm font-bold text-slate-900">{h.temp}°C</span>
              <span className="text-[11px] text-sky-700 font-medium mt-1">💧 {h.rain_prob}%</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{h.wind} km/h</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 7-Day Extended Forecast */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ (7-Day Extended Forecast)</h3>
        </div>

        <div className="space-y-2.5">
          {weatherData?.daily_7d?.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs sm:text-sm"
            >
              <div className="w-28 sm:w-36 font-semibold text-slate-800 truncate">
                {d.date}
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span className="font-medium">{d.condition}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900">{d.temp_max}°C</span>
                <span className="text-slate-400 ml-1.5 text-xs font-medium">/ {d.temp_min}°C</span>
                <span className="ml-3 text-xs font-semibold text-sky-700">💧 {d.rain_prob}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
