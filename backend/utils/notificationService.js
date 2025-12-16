const Notification = require('../models/Notification');

/**
 * Create a new notification
 * @param {Object} data
 * @param {string} data.recipient - Recipient ID
 * @param {string} data.recipientModel - 'ProviderAuth', 'PatientAuth', or 'AdminAuth'
 * @param {string} data.type - 'emergency', 'lab', 'appointment', 'system'
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 */
const createNotification = async ({ recipient, recipientModel, type, title, message }) => {
  try {
    const notification = new Notification({
      recipient,
      recipientModel,
      type,
      title,
      message
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error to prevent blocking main flow
    return null;
  }
};

module.exports = { createNotification };
