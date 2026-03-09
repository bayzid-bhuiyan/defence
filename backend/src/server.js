require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const http = require('http'); 
const { Server } = require('socket.io'); 
const prisma = require('./config/db');
const userRoutes = require('./routes/userRoutes'); 

require('./config/passport'); 

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const commentRoutes = require('./routes/commentRoutes'); 
const likeRoutes = require('./routes/likeRoutes');

const app = express();
app.set('trust proxy', 1); 

const FRONTEND_URL = process.env.CLIENT_URL || "frontend_url";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, 
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

app.set('io', io);

app.use(cors({ 
  origin: FRONTEND_URL, 
  credentials: true 
}));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/comments', commentRoutes); 
app.use('/api/likes', likeRoutes);      
app.use('/api/users', userRoutes); 


app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'success', message: 'Database connected & Server running' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket Connected: ${socket.id}`);

  socket.on('join_inventory', (inventoryId) => {
    const roomName = `inventory_${inventoryId}`;
    socket.join(roomName);
  });

  socket.on('leave_inventory', (inventoryId) => {
    const roomName = `inventory_${inventoryId}`;
    socket.leave(roomName);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket Disconnected: ${socket.id}`);
  });

  socket.on('send_comment', (data) => {
    socket.to(data.room).emit('receive_comment', data.comment); 
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server & WebSocket running on port ${PORT}`);
  console.log(`Allowed Origin: ${FRONTEND_URL}`);
});