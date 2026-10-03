# SigmaTerminal — AI-Powered Crypto Market Intelligence

> A decision-support crypto intelligence terminal combining real-time market data, algorithmic technical analysis, and AI-generated scenario-based market commentary.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — app works without it using in-memory fallback)
- Gemini API Key (optional — falls back to signal-engine-only analysis)

### 1. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. Open Dashboard
Navigate to `http://localhost:5173`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend server port |
| `MONGODB_URI` | No | `mongodb://localhost:27017/sigma-terminal` | MongoDB connection string |
| `GEMINI_API_KEY` | No | — | Google Gemini API key for AI analysis |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Frontend origin for CORS |

## Features

- **Live Market Data** — Real-time prices from Binance (CoinGecko fallback)
- **Candlestick Charts** — TradingView Lightweight Charts with 6 timeframes
- **Indicator Engine** — SMA, EMA, RSI, MACD, ATR, VWAP, Momentum, Volatility, Support/Resistance
- **Signal Engine** — Rule-based setup detection (breakout, pullback, overbought, etc.)
- **AI Analysis** — Gemini-powered scenario-based market commentary
- **Watchlist** — Persistent coin tracking with live prices
- **Alerts** — RSI threshold, volume spike, trend change detection
- **WebSocket** — Real-time price updates via Socket.io

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | MongoDB (optional) |
| Real-time | Socket.io |
| Charts | TradingView Lightweight Charts v5 |
| AI | Google Gemini 1.5 Flash |
| Market Data | Binance API (primary), CoinGecko (fallback) |

## Architecture

```
Client (React) → Vite Proxy → Express API → Binance/CoinGecko
                     ↕                ↕
               Socket.io         Gemini AI
                                     ↕
                                 MongoDB
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/market/:symbol` | Market data + indicators |
| GET | `/api/market/:symbol/candles` | Candlestick data |
| GET | `/api/analysis/:symbol` | Signal analysis |
| GET | `/api/ai-analysis/:symbol` | Full AI analysis |
| GET | `/api/watchlist` | Get watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:symbol` | Remove from watchlist |
| GET | `/api/alerts` | Get alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Dismiss alert |

## License

MIT
