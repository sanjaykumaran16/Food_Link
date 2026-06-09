const Notification = require('../models/Notification');

const createNotification = async ({ user, type, title, message, relatedListing, io }) => {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    relatedListing: relatedListing || null,
  });

  if (io) {
    io.to(String(user)).emit('notification', notification);
  }

  return notification;
};

module.exports = { createNotification };
