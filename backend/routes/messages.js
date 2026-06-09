const express = require('express');
const asyncHandler = require('express-async-handler');
const auth = require('../middleware/auth');
const { Message, buildConversationId } = require('../utils/messages');

const router = express.Router();

router.get(
  '/conversations',
  auth,
  asyncHandler(async (req, res) => {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name role profilePhoto')
      .populate('receiver', 'name role profilePhoto')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    const conversations = {};
    for (const msg of messages) {
      if (!conversations[msg.conversationId]) {
        const other =
          msg.sender._id.toString() === req.user._id.toString()
            ? msg.receiver
            : msg.sender;
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          otherUser: other,
          listing: msg.listing,
          lastMessage: msg,
          unread: 0,
        };
      }
      if (
        msg.receiver._id.toString() === req.user._id.toString() &&
        !msg.isRead
      ) {
        conversations[msg.conversationId].unread += 1;
      }
    }
    res.json(Object.values(conversations));
  })
);

router.get(
  '/:conversationId',
  auth,
  asyncHandler(async (req, res) => {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json(messages);
  })
);

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { receiver, listing, text } = req.body;
    if (!receiver || !text) {
      res.status(400);
      throw new Error('receiver and text required');
    }

    const conversationId = buildConversationId(
      req.user._id,
      receiver,
      listing
    );

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver,
      listing: listing || null,
      text,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .populate('listing', 'title');

    const io = req.app.get('io');
    if (io) {
      io.to(String(receiver)).emit('chat:message', populated);
      io.to(conversationId).emit('chat:message', populated);
    }

    res.status(201).json(populated);
  })
);

module.exports = router;
