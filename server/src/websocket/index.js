import { Server } from 'socket.io';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';
import { setupHandlers } from './handlers.js';

let io = null;

export const initWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);
    setupHandlers(socket, io);

    socket.on('disconnect', (reason) => {
      logger.debug(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

export const getIO = () => io;

export const emitToAll = (event, data) => {
  if (io) io.emit(event, data);
};
