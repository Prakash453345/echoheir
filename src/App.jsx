// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LegacyWizardPage from './pages/LegacyWizardPage';
import ChatPage from './pages/ChatPage';
import MemoryBrowserPage from './pages/MemoryBrowserPage';
import SettingsPage from './pages/SettingsPage';
import VoiceLabPage from './pages/VoiceLabPage';
import Navbar from './components/Navbar';


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wizard" element={<LegacyWizardPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/memory-browser" element={<MemoryBrowserPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/voice-lab" element={<VoiceLabPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;