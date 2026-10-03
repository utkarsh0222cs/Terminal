import { createServer } from 'http';
import app from './app.js';
import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { initWebSocket } from './websocket/index.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  // Connect to database (non-blocking — app works without DB)
  await connectDatabase();

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket
  initWebSocket(httpServer);

  // Start listening
  httpServer.listen(config.port, () => {
    logger.info(`
╔══════════════════════════════════════════╗
║       SigmaTerminal Server v1.0.0       ║
║──────────────────────────────────────────║
║  REST API:  http://localhost:${config.port}       ║
║  WebSocket: ws://localhost:${config.port}         ║
║  Env:       ${config.nodeEnv.padEnd(27)}║
║  Gemini:    ${config.geminiApiKey ? 'Configured ✓' : 'Not configured ✗ (fallback mode)'}${' '.repeat(Math.max(0, 15 - (config.geminiApiKey ? 14 : 35)))}║
╚══════════════════════════════════════════╝
    `);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
