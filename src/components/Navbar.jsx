import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  Globe, 
  User, 
  LogOut, 
  ShieldCheck, 
  Database,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  currentLang, 
  setLang, 
  langData, 
  user, 
  onOpenAuth, 
  onLogout, 
  activeTab, 
  setActiveTab,
  lowDataMode,
  setLowDataMode
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const languages = [
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'mr', label: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-kisan-700 flex items-center justify-center text-white shadow-md group-hover:bg-kisan-800 transition-colors">
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {langData.appTitle}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Bharat Agri
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {langData.tagline}
              </p>
            </div>
          </div>

          {/* Center Navigation Shortcuts (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('crop-ai')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'crop-ai'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {langData.actionDiagnose}
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'weather'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {langData.actionWeather}
            </button>
            <button
              onClick={() => setActiveTab('mandi')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'mandi'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {langData.actionMandi}
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'schemes'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {langData.actionSchemes}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-kisan-50 text-kisan-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {langData.actionChat}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Online / Offline status badge */}
            <div 
              title={isOnline ? "Connected to Internet" : "Offline mode: Local cached advisories available"}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{langData.online}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{langData.offline}</span>
                </>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative inline-flex items-center">
              <Globe className="w-4 h-4 text-slate-500 absolute left-2 pointer-events-none" />
              <select
                value={currentLang}
                onChange={(e) => setLang(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-medium rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-kisan-500 focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('diary')}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800"
                >
                  <User className="w-4 h-4 text-kisan-700" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[10px] uppercase font-bold">Admin</span>
                  )}
                  {user.role === 'expert' && (
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[10px] uppercase font-bold">Expert</span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  title={langData.logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-kisan-700 hover:bg-kisan-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                {langData.login}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'dashboard' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('crop-ai'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'crop-ai' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            {langData.actionDiagnose}
          </button>
          <button
            onClick={() => { setActiveTab('weather'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'weather' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            {langData.actionWeather}
          </button>
          <button
            onClick={() => { setActiveTab('mandi'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'mandi' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            {langData.actionMandi}
          </button>
          <button
            onClick={() => { setActiveTab('schemes'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'schemes' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            {langData.actionSchemes}
          </button>
          <button
            onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
              activeTab === 'chat' ? 'bg-kisan-50 text-kisan-800 font-bold' : 'text-slate-700'
            }`}
          >
            {langData.actionChat}
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveTab('spray'); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {langData.toolSpray}
            </button>
            <button
              onClick={() => { setActiveTab('loss'); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {langData.toolLoss}
            </button>
            <button
              onClick={() => { setActiveTab('profit'); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {langData.toolProfit}
            </button>
            <button
              onClick={() => { setActiveTab('expert'); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {langData.toolExpert}
            </button>
            <button
              onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {langData.toolCommunity}
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 bg-purple-100 text-purple-800 text-xs rounded-md font-bold"
              >
                {langData.toolAdmin}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
