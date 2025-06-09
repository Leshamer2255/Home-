import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Card, Form, Modal, ListGroup, Badge } from 'react-bootstrap';
import { FaBell, FaEnvelope, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import type { Notification, NotificationSettings, NotificationType, NotificationPriority } from '../services/NotificationService';
import NotificationService from '../services/NotificationService';

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
    emailAddress: '',
    reminderEnabled: true,
    expiryEnabled: true,
    categories: ['tasks', 'shopping', 'calendar', 'finance', 'inventory']
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    type: 'push' as NotificationType,
    priority: 'medium' as NotificationPriority
  });
  const [isLoading, setIsLoading] = useState(true);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        const [loadedNotifications, loadedSettings] = await Promise.all([
          notificationService.getNotifications(),
          notificationService.getSettings()
        ]);
        setNotifications(loadedNotifications);
        setSettings(loadedSettings);

        // Request notification permission
        if ('Notification' in window) {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.error('Помилка ініціалізації сповіщень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, []);

  const handleSettingsSave = async () => {
    try {
      await notificationService.updateSettings(settings);
      setShowSettings(false);
    } catch (error) {
      console.error('Помилка збереження налаштувань:', error);
    }
  };

  const addNotification = async () => {
    if (newNotification.title && newNotification.message) {
      try {
        const notification = await notificationService.addNotification({
          type: newNotification.type as NotificationType,
          title: newNotification.title,
          message: newNotification.message,
          priority: newNotification.priority as NotificationPriority,
          category: newNotification.category
        });
        setNotifications([notification, ...notifications]);
        setShowNewNotification(false);
        setNewNotification({ type: 'push' as NotificationType, priority: 'medium' as NotificationPriority });
      } catch (error) {
        console.error('Помилка додавання сповіщення:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Помилка позначення сповіщення як прочитаного:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Помилка видалення сповіщення:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'push':
        return <FaBell className="text-primary" />;
      case 'email':
        return <FaEnvelope className="text-success" />;
      case 'reminder':
        return <FaClock className="text-warning" />;
      case 'expiry':
        return <FaExclamationTriangle className="text-danger" />;
      default:
        return <FaBell className="text-primary" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">Високий</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark">Середній</Badge>;
      case 'low':
        return <Badge bg="success">Низький</Badge>;
      default:
        return null;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewNotification(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Сповіщення</h2>
            <div>
              <Button variant="light" className="me-2" onClick={() => setShowSettings(true)}>
                <i className="fas fa-cog me-2"></i>Налаштування
              </Button>
              <Button variant="light" onClick={() => setShowNewNotification(true)}>
                <i className="fas fa-plus me-2"></i>Нове сповіщення
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <ListGroup>
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <FaBell size={48} className="text-muted mb-3" />
                <h4>Немає сповіщень</h4>
                <p className="text-muted">Створіть нове сповіщення або налаштуйте їх отримання</p>
              </div>
            ) : (
              notifications.map(notification => (
                <ListGroup.Item
                  key={notification.id}
                  className={`d-flex justify-content-between align-items-center ${!notification.read ? 'fw-bold' : ''}`}
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h5 className="mb-1">{notification.title}</h5>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.date).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    {getPriorityBadge(notification.priority)}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      {notification.read ? 'Прочитано' : 'Позначити як прочитане'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Видалити
                    </Button>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Налаштування сповіщень</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="pushEnabled"
                name="pushEnabled"
                label="Push-сповіщення"
                checked={settings.pushEnabled}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="emailEnabled"
                name="emailEnabled"
                label="Email-сповіщення"
                checked={settings.emailEnabled}
                onChange={handleInputChange}
              />
            </Form.Group>
            {settings.emailEnabled && (
              <Form.Group className="mb-3">
                <Form.Label>Email адреса</Form.Label>
                <Form.Control
                  type="email"
                  name="emailAddress"
                  value={settings.emailAddress}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="reminderEnabled"
                name="reminderEnabled"
                label="Нагадування"
                checked={settings.reminderEnabled}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="expiryEnabled"
                name="expiryEnabled"
                label="Сповіщення про термін придатності"
                checked={settings.expiryEnabled}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleSettingsSave}>
            Зберегти
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Notification Modal */}
      <Modal show={showNewNotification} onHide={() => setShowNewNotification(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Нове сповіщення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Тип сповіщення</Form.Label>
              <Form.Select
                name="type"
                value={newNotification.type}
                onChange={handleInputChange}
              >
                <option value="push">Push-сповіщення</option>
                <option value="email">Email-сповіщення</option>
                <option value="reminder">Нагадування</option>
                <option value="expiry">Термін придатності</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Заголовок</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newNotification.title || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Повідомлення</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                rows={3}
                value={newNotification.message || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Пріоритет</Form.Label>
              <Form.Select
                name="priority"
                value={newNotification.priority}
                onChange={handleInputChange}
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewNotification(false)}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={addNotification}>
            Створити
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationSystem; 