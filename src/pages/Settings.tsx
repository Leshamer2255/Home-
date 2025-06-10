import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings-page">
      <h1>Налаштування</h1>
      
      <section className="settings-section">
        <h2>Тема</h2>
        <div className="theme-options">
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Світла
          </button>
          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Темна
          </button>
          <button
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
          >
            Системна
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Мова</h2>
        <select className="language-select">
          <option value="uk">Українська</option>
          <option value="en">English</option>
        </select>
      </section>
    </div>
  );
}; 