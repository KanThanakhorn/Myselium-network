require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Initialize MongoDB connection
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with actual frontend URL
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (useful for simple dashboard frontends)
// app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Root route redirect/message
app.get('/', (req, res) => {
  res.send('Welcome to the Mycelium Sensors Network API. Access endpoints via /api/health');
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a standard dashboard room
  socket.on('join_dashboard', () => {
    socket.join('dashboard');
    console.log(`Socket ${socket.id} joined dashboard room`);
  });

  // Client disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make socket.io instance accessible in requests if needed
app.set('io', io);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
