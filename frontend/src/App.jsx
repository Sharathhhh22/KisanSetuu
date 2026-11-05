import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import FarmerDashboard from './components/FarmerDashboard';
import CropIntelligence from './components/CropIntelligence';
import KisanAssistant from './components/KisanAssistant';
import WeatherIntelligence from './components/WeatherIntelligence';
import MandiIntelligence from './components/MandiIntelligence';
import SchemeFinder from './components/SchemeFinder';
import ExpertConnect from './components/ExpertConnect';
import SprayAssistant from './components/SprayAssistant';
import LossDocumentation from './components/LossDocumentation';
import ProfitCalculator from './components/ProfitCalculator';
import CommunityNetwork from './components/CommunityNetwork';
import CropHistory from './components/CropHistory';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { getLang } from './i18n/translations';
import { PhoneCall, ShieldCheck, Sprout } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('kisansetu_lang') || 'kn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [mandiData, setMandiData] = useState(null);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [pendingExpertQuery, setPendingExpertQuery] = useState(null);

  const langData = getLang(currentLang);

  const handleSetLang = (code) => {
    setCurrentLang(code);
    localStorage.setItem('kisansetu_lang', code);
  };

  // Check authenticated session
  useEffect(() => {
    const token = localStorage.getItem('kisansetu_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => {
          setUser(data.user);
          if (data.user.language) handleSetLang(data.user.language);
        })
        .catch(() => {
          localStorage.removeItem('kisansetu_token');
          setUser(null);
        });
    }
  }, []);

  // Pre-fetch initial weather and mandi snapshot for dashboard
  useEffect(() => {
    fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district: user?.district || 'Mandya', language: currentLang })
    })
      .then(r => r.json())
      .then(d => setWeatherData(d))
      .catch(err => console.error(err));

    fetch('/api/mandi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: 'All', district: 'All', state: 'Karnataka' })
    })
      .then(r => r.json())
      .then(d => setMandiData(d))
      .catch(err => console.error(err));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('kisansetu_token');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleForwardToExpert = (query) => {
    setPendingExpertQuery(query);
    setActiveTab('expert');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-green-100 selection:text-green-900 font-sans">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        setLang={handleSetLang}
        langData={langData}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowDataMode={lowDataMode}
        setLowDataMode={setLowDataMode}
      />

      {/* 2. Offline Status Banner */}
      <OfflineBanner langData={langData} />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {activeTab === 'dashboard' && (
          <FarmerDashboard
            langData={langData}
            setActiveTab={setActiveTab}
            user={user}
            weatherData={weatherData}
            mandiData={mandiData}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'crop-ai' && (
          <CropIntelligence
            langData={langData}
            user={user}
            setActiveTab={setActiveTab}
            onForwardToExpert={handleForwardToExpert}
          />
        )}

        {activeTab === 'chat' && (
          <KisanAssistant
            langData={langData}
            currentLang={currentLang}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherIntelligence
            langData={langData}
            weatherData={weatherData}
            setWeatherData={setWeatherData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'mandi' && (
          <MandiIntelligence
            langData={langData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemeFinder
            langData={langData}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'expert' && (
          <ExpertConnect
            langData={langData}
            user={user}
            initialQuery={pendingExpertQuery}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'spray' && (
          <SprayAssistant
            langData={langData}
            weatherData={weatherData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'loss' && (
          <LossDocumentation
            langData={langData}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profit' && (
          <ProfitCalculator
            langData={langData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'community' && (
          <CommunityNetwork
            langData={langData}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'diary' && (
          <CropHistory
            langData={langData}
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            langData={langData}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* 4. Farmer-First Emergency Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-kisan-700 text-white flex items-center justify-center font-bold text-xs">
                KS
              </div>
              <span className="font-bold text-slate-800">ಕಿಸಾನ್ ಸೇತು (Kisan Setu)</span>
              <span>— ಭಾರತೀಯ ರೈತರ ಡಿಜಿಟಲ್ ಕೃಷಿ ವೇದಿಕೆ</span>
            </div>

            {/* Helpline highlight */}
            <div className="flex items-center space-x-3 bg-green-50 px-3.5 py-1.5 rounded-full border border-green-200 text-green-900 font-semibold">
              <PhoneCall className="w-4 h-4 text-green-700" />
              <span>ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (Kisan Call Centre Toll-Free): <strong>1800-180-1551</strong></span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-kisan-700" />
                ICAR & KVK Package of Practices
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.language) handleSetLang(loggedUser.language);
        }}
      />

    </div>
  );
}
