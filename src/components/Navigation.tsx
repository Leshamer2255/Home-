import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaShoppingCart, FaCalendarAlt, FaUsers, FaBell, FaChartLine, FaBox } from 'react-icons/fa';
import NotificationService from '../services/NotificationService';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    const updateUnreadCount = async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000); // Оновлення кожні 30 секунд

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Головна' },
    { path: '/tasks', icon: <FaTasks />, label: 'Завдання' },
    { path: '/shopping', icon: <FaShoppingCart />, label: 'Покупки' },
    { path: '/calendar', icon: <FaCalendarAlt />, label: 'Календар' },
    { path: '/family', icon: <FaUsers />, label: "Сім'я" },
    { path: '/finance', icon: <FaChartLine />, label: 'Фінанси' },
    { path: '/inventory', icon: <FaBox />, label: 'Інвентар' },
    { 
      path: '/notifications', 
      icon: <FaBell />, 
      label: 'Сповіщення',
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Home+</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                active={location.pathname === item.path}
                className="d-flex align-items-center"
              >
                <span className="me-1">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <Badge bg="danger" className="ms-1">
                    {item.badge}
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 