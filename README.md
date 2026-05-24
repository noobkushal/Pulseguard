# 📡 PulseGuard AI

> **Real-Time ICU Telemetry Biosync & Predictive Clinical Deterioration Surveillance Platform**

PulseGuard AI is a state-of-the-art clinical decision support system designed for high-acuity intensive care units (ICUs). It combines a high-fidelity, responsive React/TypeScript surveillance dashboard with a fast Python/FastAPI backend and a machine-learning-driven clinical risk engine to predict patient deterioration hours before it occurs.

---

## 🚀 Key Features

* **🖥️ ICU Command Console:** A real-time, premium clinical dashboard showcasing patient surveillance grids, lead-II live ECG stream simulations, and real-time vital telemetry.
* **🧠 AI Predictive Analytics:** Live machine learning calculations tracking patient deterioration probability, ward-wide stability indices, and 4-hour shock onset predictions.
* **🚨 Smart Alert Hub:** A sophisticated alarm dispatch center featuring de-duplicated patient alerts (only showing the most relevant active event) and automatic filter tab routing upon alert acknowledgement or resolution.
* **🔌 IoT Topology Monitor:** A visual map of active clinical devices (ECG patches, ventilators, infusion pumps) tracking firmware, signal strength, and network uptime.
* **🔔 Dashboard Notification Bar:** A prominent top banner and interactive beacon alerts notifying clinicians of immediate critical events, with options to clear items from the viewport while preserving them securely in the global notification log history.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Vanilla CSS (Aesthetic glassmorphism, glowing telemetry states, dark mode optimized)
- **Icons:** Lucide React

### Backend & AI Engine
- **Framework:** Python + FastAPI (REST API with SQLite row-mapping)
- **Database:** SQLite (`hospital.db` storing historical patient telemetry)
- **Clinical Engine:** `pandas` + `scikit-learn` calculating standard NEWS2 scores, clinical shock indices, and predictive anomaly factors.

---

## 🏃 Getting Started

To run the full platform locally, follow these steps:

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### 1. Set Up and Run the Python Backend
Navigate to the `backend` folder, set up your environment, and start the FastAPI server:
```bash
# Navigate to the backend
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python api_server.py
```
The API server will run at `http://localhost:8000`.

### 2. Set Up and Run the React Frontend
Navigate to the root directory, install npm packages, and start Vite:
```bash
# Install npm dependencies
npm install

# Run the development server
npm run dev
```
The application dashboard will be live at `http://localhost:5173`.

---

## 📐 Project Structure

```
├── backend/                  # FastAPI backend and risk engine
│   ├── api_server.py         # REST API server & database routing
│   ├── risk_engine.py        # ML predictive risk model
│   ├── news2_engine.py       # NEWS2 clinical deterioration scoring
│   ├── database_setup.py     # Schema definitions & database builder
│   └── hospital.db           # SQLite database
├── src/                      # React application source
│   ├── components/           # Reusable UI widgets & telemetry views
│   ├── context/              # PulseGuard global state provider
│   ├── pages/                # High-fidelity dashboard views
│   └── services/             # Axios/fetch API client wrapper
├── package.json              # Frontend scripts & dependencies
└── vite.config.ts            # Vite compiler configuration
```

---

## 🔒 Security & Medical Standards Note
*This software is an AI clinical telemetry prototype designed for hackathons and proof-of-concepts. It simulates clinical telemetry using cleaning algorithms based on the MIMIC critical care dataset.*
