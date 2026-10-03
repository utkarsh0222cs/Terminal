import { ThemeProvider } from './context/ThemeContext';
import { MarketProvider } from './context/MarketContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { SocketProvider } from './context/SocketContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <WatchlistProvider>
          <MarketProvider>
            <Dashboard />
          </MarketProvider>
        </WatchlistProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}
