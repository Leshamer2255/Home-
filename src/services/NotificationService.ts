// Types
export type NotificationType = 'push' | 'email' | 'reminder' | 'expiry';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  priority: NotificationPriority;
  category?: string;
  expiryDate?: Date;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  emailAddress: string;
  reminderEnabled: boolean;
  expiryEnabled: boolean;
  categories: string[];
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private settings: NotificationSettings = {
    pushEnabled: true,
    emailEnabled: false,
    emailAddress: '',
    reminderEnabled: true,
    expiryEnabled: true,
    categories: ['tasks', 'shopping', 'calendar', 'finance', 'inventory']
  };
  private initialized = false;

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      await this.loadFromStorage();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      this.initialized = false;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadFromStorage() {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications);
      }

      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      // Reset to defaults if loading fails
      this.notifications = [];
      this.settings = {
        pushEnabled: true,
        emailEnabled: false,
        emailAddress: '',
        reminderEnabled: true,
        expiryEnabled: true,
        categories: ['tasks', 'shopping', 'calendar', 'finance', 'inventory']
      };
    }
  }

  private async saveToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  public async getNotifications(): Promise<Notification[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.notifications;
  }

  public async getSettings(): Promise<NotificationSettings> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.settings;
  }

  public async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveToStorage();
  }

  public async addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>) {
    if (!this.initialized) {
      await this.initialize();
    }

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    await this.saveToStorage();

    // Send push notification if enabled
    if (this.settings.pushEnabled && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo192.png'
          });
        }
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    // Send email notification if enabled
    if (this.settings.emailEnabled && this.settings.emailAddress) {
      // Here you would implement email sending logic
      console.log('Sending email to:', this.settings.emailAddress);
    }

    return newNotification;
  }

  public async markAsRead(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.notifications = this.notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    await this.saveToStorage();
  }

  public async deleteNotification(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.notifications = this.notifications.filter(notification => notification.id !== id);
    await this.saveToStorage();
  }

  public async getUnreadCount(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.notifications.filter(notification => !notification.read).length;
  }

  public async checkExpiryDates(items: { id: string; name: string; expiryDate: Date }[]) {
    if (!this.initialized) {
      await this.initialize();
    }

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    for (const item of items) {
      const expiryDate = new Date(item.expiryDate);
      if (expiryDate <= threeDaysFromNow && expiryDate >= today) {
        await this.addNotification({
          type: 'expiry',
          title: 'Термін придатності закінчується',
          message: `${item.name} закінчується ${expiryDate.toLocaleDateString()}`,
          priority: 'high',
          category: 'inventory'
        });
      }
    }
  }

  public async checkUpcomingEvents(events: { id: string; title: string; start: Date }[]) {
    if (!this.initialized) {
      await this.initialize();
    }

    const now = new Date();
    const oneHourFromNow = new Date(now);
    oneHourFromNow.setHours(now.getHours() + 1);

    for (const event of events) {
      const eventStart = new Date(event.start);
      if (eventStart <= oneHourFromNow && eventStart > now) {
        await this.addNotification({
          type: 'reminder',
          title: 'Нагадування про подію',
          message: `${event.title} починається через годину`,
          priority: 'medium',
          category: 'calendar'
        });
      }
    }
  }
}

export default NotificationService; 