# Kisan Setu (ಕಿಸಾನ್ ಸೇತು / किसान सेतु)
### Unified Digital Agricultural Assistance Platform for Indian Farmers

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-Multimodal%20AI-8E75B2.svg)](https://ai.google.dev)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-green.svg)](https://web.dev/progressive-web-apps/)

---

## 🌾 1. Product Vision

**Kisan Setu** is an intelligent, farmer-first agricultural assistance platform created to empower Indian farmers with verified scientific guidance, real-time weather alerts, APMC market price discovery, and government subsidy access.

### Core Architectural Pillars
- **Farmer-First**: Designed with maximum 5 primary actions on the main dashboard, large touch targets, and high contrast.
- **Offline-First**: Progressive Web App with Service Worker (`sw.js`) and IndexedDB/localStorage fallback.
- **Local-Language-First**: Native support for **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, **English**, **Telugu**, **Tamil**, **Malayalam**, and **Marathi**.
- **Voice-First**: Web Speech API speech-to-text input and browser SpeechSynthesis read-aloud for farmers with limited literacy.
- **Trust & Scientific Grounding**: Grounded in ICAR, UAS Dharwad, GKVK Bengaluru, and KVK package of practices. Zero hallucination of chemical dosages or fake government schemes.

---

## 🚜 2. Complete Platform Modules

### Module A — AI Crop Intelligence
- **Camera & Image Upload**: Farmers take a leaf/stem photo directly from mobile cameras.
- **Multimodal Vision Analysis**: Powered by Google Gemini vision models with an agronomic fallback knowledge base.
- **Structured Scientific Diagnosis**: Identifies crop name, condition, confidence score, visible symptoms, causes, recommended next steps (cultural, biological, and IPM chemicals), what to avoid, and source attribution.
- **Expert Escalation**: One-click escalation to verified agricultural officers when confidence is low or complex.
- **Voice Read-Aloud**: Full speech synthesis of the diagnosis in regional languages.

### Module B — Kisan AI Assistant
- **Multimodal & Voice-Enabled**: Text, voice input, and image attachments.
- **Farm-Context Grounding**: Injects the farmer's registered crops, soil type, and district into every conversation.
- **Factual Agricultural Scope**: Never fabricates market prices, weather forecasts, or chemical combinations.

### Module C — Smart Weather Intelligence
- **Real-Time Integration**: Uses official meteorological data from Open-Meteo for high precision without API rate limits.
- **Forecast Horizon**: Current conditions, 24-hour hourly timeline, and 7-day extended outlook.
- **Agronomic Advisory Alerts**: Automatically issues spray delay warnings, foliar blight alerts, and irrigation schedules.

### Module D — Smart Mandi & Market Intelligence
- **Official Agmarknet Rates**: Live and modal auction prices for Karnataka APMC markets (Mandya, Kolar, Bangalore, Raichur, Hubli, Davanagere, Kalaburagi).
- **Arbitrage Insights**: Highlights price differences between neighboring markets.
- **Net Return Realization**: Transparently deducts estimated transport and freight costs from modal prices based on distance.

### Module E — Government Scheme Finder
- **Central & Karnataka State Schemes**: Covers PM-KISAN, Raitha Siri (Millet incentive), Krishi Bhagya (Farm ponds), PM Fasal Bima Yojana (PMFBY), Ganga Kalyana, KCC loans, and Raitha Vidyanidhi scholarships.
- **Transparent Eligibility Engine**: Considers state, landholding in acres, crop category, and farmer category.
- **Direct Portal Links & Document Checklists**: Direct access to `pmkisan.gov.in`, `fruits.karnataka.gov.in`, `sevasindhu.karnataka.gov.in`.

### Module F — Farmer Expert Connect
- **Verified Expert Directory**: Features certified agricultural scientists, extension officers, and entomologists with verified badges.
- **Consultation Tracking**: Status progression from *Submitted* to *In Review* and *Answered*.
- **Role-Based Workflow**: Verified experts and admins can answer farmer queries directly from their console.

---

## 🛠️ 3. Unique Differentiator Features

| Feature | Purpose |
|---|---|
| **Feature 1: Digital Field Diary** | Crop health history tracking sowing date, growth stage, acreage, and soil health notes. |
| **Feature 2: Smart Farm Memory** | Farmer profile that remembers land size, soil type, and active crops to personalize all future AI guidance. |
| **Feature 3: Before You Spray** | Evaluates local rain risk, wind drift, and temperature against CIBRC safety protocols before spraying. |
| **Feature 4: Crop Loss Documentation** | Generates an official printable/downloadable incident report (`KS-LOSS-MAN-XXXX`) for revenue inspectors and insurance surveyors. |
| **Feature 5: Farmer Profit Calculator** | Granular economic calculator for cultivation expenses, gross revenue, net profit/loss, and break-even selling price per quintal. |
| **Feature 6: Community Knowledge Network** | Peer-to-peer farmer forum with crop filters, upvoting, and verified scientist responses. |
| **Feature 7: Offline Farmer Mode (PWA)** | Service worker caching, offline advisory access, and low-bandwidth friendly operation. |

---

## 🔒 4. Admin Dashboard (Section 7)

A secure administrative console accessible via `/api/admin/overview`:
- **Platform Analytics**: Total registered farmers, active experts, AI diagnoses run, and loss incident reports.
- **Role Management**: Inspect users, promote experts, and grant official *Verified Expert* badges.

---

## 💻 5. Tech Stack & Architecture

- **Backend**: Python 3.14 + FastAPI + SQLite (WAL concurrency mode) + Pydantic v2.
- **Frontend**: Vite 6 + React 18 + Tailwind CSS 3.4 + Lucide Icons.
- **AI Integrations**: Google Gemini API (`gemini-flash-lite-latest`, `gemini-3.5-flash-lite`).
- **Weather API**: Open-Meteo API (Latitude/Longitude coordinates for all 31 districts of Karnataka).
- **Deployment**: Configured for Vercel Serverless (`api/index.py`, `vercel.json`) and Windows Desktop (`run_kisansetu.bat`).

---

## 🚀 6. Getting Started

### Prerequisites
- Python 3.10+ (Tested on Python 3.14.7)
- Node.js 18+ and npm (Tested on Node v26.13.0)

### One-Click Desktop Launch (Windows)
Double-click `run_kisansetu.bat` in the project root:
```cmd
run_kisansetu.bat
```
This automatically verifies the environment, checks frontend build assets, starts Uvicorn on `http://localhost:8000`, and opens the platform in your default browser.

### Manual Setup
1. **Backend**:
   ```bash
   pip install -r backend/requirements.txt
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Frontend (Development Mode)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Frontend (Production Build)**:
   ```bash
   cd frontend
   npm run build
   ```

---

## 🧪 7. Running the Test Suite

Execute the comprehensive automated test suite to validate all 14 platform components:
```bash
python test_kisansetu.py
```
**Test Coverage**:
- Database persistence & migrations
- Health & district pre-mapped coordinates
- PBKDF2 password hashing & token authentication
- AI Crop Intelligence & agronomic fallback
- Kisan AI assistant conversational flow
- Live Open-Meteo weather integration
- Agmarknet mandi rates & transport cost deduction
- Government scheme eligibility engine
- Expert directory & consultation answers
- Spray decision evaluator & CIBRC warnings
- Crop loss incident report code generation
- Profit & break-even calculation formulas
- Community forum & Admin metrics

---

## 🔑 8. Pre-Seeded Test Credentials

| Role | Mobile Number | Password | Notes |
|---|---|---|---|
| **Farmer** | `9845012345` | `Farmer@123` | Ninge Gowda (Mandya, 3.5 acres, Ragi & Tomato) |
| **Expert** | `9880112233` | `Expert@Kisan2026` | Dr. Ramesh Patil (Principal Scientist, ICAR-UAS) |
| **Admin** | `9999900000` | `Admin@KisanSetu2026` | Kisan Setu System Administrator |

---

## ☁️ 9. Vercel Deployment Checklist

To deploy to Vercel:
1. Push repository to GitHub or GitLab.
2. In Vercel Project Settings, add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `GEMINI_MODEL`: `gemini-flash-lite-latest`
   - `SECRET_KEY`: A secure random cryptographic key.
   - `ENVIRONMENT`: `production`
3. Vercel uses `vercel.json` and `api/index.py` to route all API calls to FastAPI while serving the compiled static assets from `frontend/dist`.

---

## 📞 10. Agricultural Helplines

- **Kisan Call Center (National Toll-Free)**: `1800-180-1551`
- **Kisan Setu Emergency Support**: Available 24/7 via the in-app *Farmer Community* and *Verified Expert Connect*.
