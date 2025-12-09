import { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI, messageAPI } from '../utils/api';
import { useSettings } from './SettingsContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { theme, updateTheme, darkMode } = useSettings();
  
  const toggleDarkMode = () => {
    updateTheme(darkMode ? 'light' : 'dark');
  };

  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          notificationAPI.getAll(),
          messageAPI.getAll()
        ]);
        setNotifications(notifRes.data);
        setMessages(msgRes.data);
      } catch (error) {
        console.error('Error fetching app data:', error);
        // Fallback to empty arrays or handle error
      }
    };

    // Only fetch if we have a token (simple check)
    if (localStorage.getItem('token')) {
      fetchData();
    }
  }, []);

  // Removed local darkMode effect since SettingsContext handles it now
  // // root.classList.add('dark');
  // // root.classList.remove('dark');
  // // root.style.backgroundColor =

  const markNotificationAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markMessageAsRead = async (id) => {
    try {
      await messageAPI.markAsRead(id);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === id ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await messageAPI.delete(id);
      setMessages(prev => prev.filter(msg => msg._id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  const value = {
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    unreadNotificationsCount,
    messages,
    markMessageAsRead,
    deleteMessage,
    unreadMessagesCount
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
