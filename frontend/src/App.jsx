import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import HabitTracker from './pages/HabitTracker';
import Goals from './pages/Goals';
import EnglishHub from './pages/EnglishHub';
import Projects from './pages/Projects';
import Journal from './pages/Journal';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0c10] text-[#f3f4f6]">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Viewport Content Area */}
        <main className="flex-1 overflow-x-hidden pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<DailyPlanner />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/english" element={<EnglishHub />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
