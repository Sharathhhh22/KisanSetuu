import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  RefreshCw,
  ArrowLeft,
  User,
  Bot,
  HelpCircle
} from 'lucide-react';

export default function KisanAssistant({ 
  langData, 
  currentLang, 
  user, 
  setActiveTab 
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      content: currentLang === 'kn'
        ? "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ಕಿಸಾನ್ ಸೇತು AI ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ ರೋಗಗಳು, ಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ಇಂದಿನ ಹವಾಮಾನ, ಮಂಡಿ ಬೆಲೆ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ನೀವು ಧ್ವನಿಯಲ್ಲಿ ಅಥವಾ ಬರೆದು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು."
        : "Namaste Kisan Bandhu! I am Kisan Setu AI Assistant. You can ask me any agricultural question regarding crop diseases, fertilizers, mandi prices, or government schemes via voice or text.",
      sources: "ICAR, UAS & KVK Agricultural Guidelines"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickPrompts = [
    { label: "ಟೊಮೆಟೊ ಎಲೆ ಹಳದಿಯಾಗುತ್ತಿದೆ", query: "ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?" },
    { label: "ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ?", query: "ನನ್ನ ಜಿಲ್ಲೆಯಲ್ಲಿ ನಾಳೆ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆಯೇ?" },
    { label: "ರಾಗಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ ಸೂಕ್ತ?", query: "ರಾಗಿ ಬೆಳೆಗೆ ತೆನೆ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಯಾವ ರಸಗೊಬ್ಬರ ಹಾಕಬೇಕು?" },
    { label: "ಪಿಎಂ-ಕಿಸಾನ್ ಅರ್ಜಿ ಮಾಹಿತಿ", query: "ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?" }
  ];

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const langMap = {
        kn: 'kn-IN',
        hi: 'hi-IN',
        en: 'en-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        ml: 'ml-IN',
        mr: 'mr-IN'
      };
      recognition.lang = langMap[currentLang] || 'kn-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ (Voice recognition not supported in this browser).");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const toggleSpeakMessage = (msgId, text) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'kn' ? 'kn-IN' : 'hi-IN';
    utterance.rate = 0.92;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMsgId(msgId);
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query && !selectedImage) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: query,
      image: selectedImage
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('kisansetu_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: query,
          conversation_id: conversationId,
          image_base64: currentImg,
          language: currentLang,
          farm_context: user ? {
            district: user.district,
            soil_type: user.soil_type,
            land_acres: user.land_acres,
            irrigation_type: user.irrigation_type
          } : null
        })
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();

      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          content: data.response,
          sources: data.sources
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          content: "ಕ್ಷಮಿಸಿ, ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
          sources: "System"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ಹಿಂದೆ (Dashboard)
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-kisan-700" />
            <span>{langData.actionChat}</span>
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-500 block">ಭಾಷೆ: {currentLang.toUpperCase()}</span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ICAR Grounded
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          ಸಲಹೆಗಳು:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="px-3 py-1 bg-white border border-slate-200 hover:border-kisan-500 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap shadow-2xs hover:bg-slate-50 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-kisan-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'
              }`}
            >
              {/* Optional Attached Image */}
              {msg.image && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                  <img src={msg.image} alt="Attached" className="max-h-48 object-cover" />
                </div>
              )}

              <p className="whitespace-pre-line">{msg.content}</p>

              {/* Bot Footer: Sources and TTS Button */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{msg.sources || "Agricultural Extension"}</span>
                  <button
                    onClick={() => toggleSpeakMessage(msg.id, msg.content)}
                    className="inline-flex items-center space-x-1 text-kisan-700 hover:text-kisan-900 font-semibold"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700">{langData.stopSpeak}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{langData.speak}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-10">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>ಕಿಸಾನ್ AI ಉತ್ತರಿಸುತ್ತಿದೆ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-sm space-y-2">
        {selectedImage && (
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl text-xs text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-4 h-4 text-kisan-700" />
              ಚಿತ್ರ ಲಗತ್ತಿಸಲಾಗಿದೆ
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 hover:bg-slate-200 rounded text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Image attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-kisan-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title="Attach Leaf Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />

          {/* Voice Input button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-kisan-700 hover:bg-slate-100'
            }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? "ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() && !selectedImage}
            className={`p-2.5 rounded-xl text-white font-semibold shrink-0 shadow-sm transition-all ${
              !inputText.trim() && !selectedImage
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-kisan-700 hover:bg-kisan-800 active:scale-95'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
