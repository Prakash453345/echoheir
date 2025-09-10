// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LegacyWizardPage from './pages/LegacyWizardPage';
import ChatPage from './pages/ChatPage';
import MemoryBrowserPage from './pages/MemoryBrowserPage';
import SettingsPage from './pages/SettingsPage';
import VoiceLabPage from './pages/VoiceLabPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wizard" element={<LegacyWizardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/memory-browser" element={<MemoryBrowserPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/voice-lab" element={<VoiceLabPage />} />
      </Routes>
    </Router>
  );
}

export default App;

