import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaDesktop, FaPalette } from 'react-icons/fa';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-label">
        <FaPalette className="theme-icon" />
        <span>Тема</span>
      </div>
      <div className="theme-buttons">
        <button
          className={`theme-button ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
          title="Світла тема"
        >
          <FaSun />
          <span>Світла</span>
        </button>
        <button
          className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
          title="Темна тема"
        >
          <FaMoon />
          <span>Темна</span>
        </button>
        <button
          className={`theme-button ${theme === 'system' ? 'active' : ''}`}
          onClick={() => setTheme('system')}
          title="Системна тема"
        >
          <FaDesktop />
          <span>Системна</span>
        </button>
      </div>
    </div>
  );
}; 