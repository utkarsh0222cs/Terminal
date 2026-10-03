import { marketService } from '../services/market/market.service.js';
import { logger } from '../utils/logger.js';

// Track subscriptions per socket
const socketSubscriptions = new Map();

// Global price polling
let pollingInterval = null;
let subscribedSymbols = new Set();

export const setupHandlers = (socket, io) => {
  // Client subscribes to a symbol's price updates
  socket.on('subscribe:price', (symbol) => {
    const upperSymbol = symbol.toUpperCase();
    logger.debug(`Socket ${socket.id} subscribing to ${upperSymbol}`);

    socket.join(`price:${upperSymbol}`);
    subscribedSymbols.add(upperSymbol);

    // Track per socket
    if (!socketSubscriptions.has(socket.id)) {
      socketSubscriptions.set(socket.id, new Set());
    }
    socketSubscriptions.get(socket.id).add(upperSymbol);

    // Start polling if not already running
    if (!pollingInterval) {
      startPricePolling(io);
    }
  });

  // Client unsubscribes
  socket.on('unsubscribe:price', (symbol) => {
    const upperSymbol = symbol.toUpperCase();
    socket.leave(`price:${upperSymbol}`);

    if (socketSubscriptions.has(socket.id)) {
      socketSubscriptions.get(socket.id).delete(upperSymbol);
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    socketSubscriptions.delete(socket.id);

    // Rebuild subscribed symbols from remaining sockets
    subscribedSymbols = new Set();
    for (const [, symbols] of socketSubscriptions) {
      for (const s of symbols) subscribedSymbols.add(s);
    }

    // Stop polling if no subscribers
    if (subscribedSymbols.size === 0 && pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      logger.debug('Price polling stopped — no subscribers');
    }
  });
};

function startPricePolling(io) {
  logger.info('Starting price polling (10s interval)');

  pollingInterval = setInterval(async () => {
    for (const symbol of subscribedSymbols) {
      try {
        const data = await marketService.getMarketData(symbol);
        io.to(`price:${symbol}`).emit('price:update', {
          symbol,
          price: data.price,
          change24h: data.change24h,
          volume24h: data.volume24h,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        logger.warn(`Price poll failed for ${symbol}:`, err.message);
      }
    }
  }, 10000); // Poll every 10 seconds
}
