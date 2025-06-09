import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Shopping from './pages/Shopping';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import NotificationSystem from './pages/Notifications';
import Family from './pages/Family';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/notifications" element={<NotificationSystem />} />
          <Route path="/family" element={<Family />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
