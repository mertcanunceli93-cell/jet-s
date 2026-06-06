import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma';
import { requestContext } from './middlewares/request-context';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { sanitizeInputs } from './middlewares/sanitize';
import { logger } from './lib/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST']
  }
});

app.use(requestContext);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(sanitizeInputs);

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import priceRoutes from './routes/price.routes';
import pricingRoutes from './routes/pricing.routes';
import userRoutes from './routes/user.routes';
import courierRoutes from './routes/courier.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import auditLogRoutes from './routes/audit-log.routes';

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info('socket.connected', { socketId: socket.id });
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info('socket.join', { socketId: socket.id, userId });
  });

  socket.on('courier_location_update', ({ orderId, location }) => {
    // Broadcast location to anyone interested in this order (usually the customer)
    io.emit(`order_location:${orderId}`, location);
  });

  socket.on('disconnect', () => {
    logger.info('socket.disconnected', { socketId: socket.id });
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info('server.started', { port: PORT });
});
