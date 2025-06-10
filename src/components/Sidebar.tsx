import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaWallet, FaTasks, FaStickyNote, FaCog } from 'react-icons/fa';

export const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Головна' },
    { path: '/calendar', icon: <FaCalendarAlt />, label: 'Календар' },
    { path: '/finances', icon: <FaWallet />, label: 'Фінанси' },
    { path: '/tasks', icon: <FaTasks />, label: 'Завдання' },
    { path: '/notes', icon: <FaStickyNote />, label: 'Нотатки' },
    { path: '/settings', icon: <FaCog />, label: 'Налаштування' },
  ];

  return (
    <aside className="sidebar theme-transition">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}; 