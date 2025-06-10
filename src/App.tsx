import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Finances } from './pages/Finances';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="page-content"
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app theme-transition">
          <Sidebar />
          <div className="main-content">
            <div className="header">
              <ThemeSwitcher />
            </div>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
                <Route path="/finances" element={<PageTransition><Finances /></PageTransition>} />
                <Route path="/tasks" element={<PageTransition><Tasks /></PageTransition>} />
                <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
