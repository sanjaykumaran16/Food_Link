require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { startExpireListingsJob } = require('./jobs/expireListings');
const { buildConversationId } = require('./utils/messages');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const claimRoutes = require('./routes/claims');
const volunteerRoutes = require('./routes/volunteers');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const impactRoutes = require('./routes/impact');
const adminRoutes = require('./routes/admin');
const templateRoutes = require('./routes/templates');
const foodlistingsLegacy = require('./routes/foodlistingsLegacy');
const statsRoutes = require('./routes/stats');
const legacy = require('./routes/legacy');

connectDB();
startExpireListingsJob();

const cloudinaryReady =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;
if (!cloudinaryReady) {
  console.warn(
    '[FoodLink] Cloudinary not configured — listings work without photos; photo/proof uploads need backend/.env keys'
  );
}

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') return res.status(204).end();
  next();
});

app.get('/', (req, res) => {
  res.send('FoodLink API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);

app.use('/api/restaurants', legacy.restaurantRouter);
app.use('/api/ngos', legacy.ngoRouter);
app.use('/api/foodlistings', foodlistingsLegacy);
app.use('/api/stats', statsRoutes);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(String(userId));
  });

  socket.on('joinConversation', ({ userId, otherUserId, listingId }) => {
    const conversationId = buildConversationId(userId, otherUserId, listingId);
    socket.join(conversationId);
  });

  socket.on('chat:send', (payload) => {
    const conversationId = buildConversationId(
      payload.sender,
      payload.receiver,
      payload.listing
    );
    io.to(conversationId).emit('chat:message', payload);
    io.to(String(payload.receiver)).emit('chat:message', payload);
  });
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error('--- SERVER ERROR ---', err.message);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FoodLink server on port ${PORT}`));

module.exports = { app, io };
