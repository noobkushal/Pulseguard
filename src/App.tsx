import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PulseGuardProvider } from './context/PulseGuardContext';
import { NotificationPopup } from './components/NotificationPopup';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PatientDetail } from './pages/PatientDetail';
import { AlertCenter } from './pages/AlertCenter';
import { IoTMonitoring } from './pages/IoTMonitoring';
import { AIAnalytics } from './pages/AIAnalytics';

const App: React.FC = () => {
  return (
    <PulseGuardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/devices" element={<IoTMonitoring />} />
          <Route path="/analytics" element={<AIAnalytics />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global alarm floating indicator */}
        <NotificationPopup />
      </BrowserRouter>
    </PulseGuardProvider>
  );
};

export default App;
