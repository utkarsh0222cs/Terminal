import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Map of common crypto symbols to CoinGecko IDs
const CRYPTO_MAP = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  BNB: { id: 'binancecoin', name: 'BNB' },
  SOL: { id: 'solana', name: 'Solana' },
  XRP: { id: 'ripple', name: 'XRP' },
  ADA: { id: 'cardano', name: 'Cardano' },
  DOGE: { id: 'dogecoin', name: 'Dogecoin' },
  AVAX: { id: 'avalanche-2', name: 'Avalanche' },
  DOT: { id: 'polkadot', name: 'Polkadot' },
  MATIC: { id: 'matic-network', name: 'Polygon' },
  LINK: { id: 'chainlink', name: 'Chainlink' },
  UNI: { id: 'uniswap', name: 'Uniswap' },
  ATOM: { id: 'cosmos', name: 'Cosmos' },
  LTC: { id: 'litecoin', name: 'Litecoin' },
  NEAR: { id: 'near', name: 'NEAR' },
  APT: { id: 'aptos', name: 'Aptos' },
  ARB: { id: 'arbitrum', name: 'Arbitrum' },
  OP: { id: 'optimism', name: 'Optimism' },
  SUI: { id: 'sui', name: 'Sui' },
  TON: { id: 'the-open-network', name: 'TON' },
};

const CRYPTO_LIST = Object.keys(CRYPTO_MAP);

// Quick-access currency chips
const QUICK_CURRENCIES = ['usd', 'inr', 'eur', 'gbp', 'jpy', 'aed'];

// Currency symbols for display
const CURRENCY_SYMBOLS = {
  usd: '$', inr: '₹', eur: '€', gbp: '£', jpy: '¥', aed: 'د.إ',
  aud: 'A$', cad: 'C$', chf: 'CHF', cny: '¥', krw: '₩', rub: '₽',
  brl: 'R$', mxn: 'MX$', sgd: 'S$', hkd: 'HK$', nok: 'kr', sek: 'kr',
  dkk: 'kr', pln: 'zł', czk: 'Kč', thb: '฿', idr: 'Rp', myr: 'RM',
  php: '₱', try: '₺', zar: 'R', ngn: '₦', pkr: '₨', bdt: '৳',
  vnd: '₫', ars: 'AR$', clp: 'CL$', cop: 'CO$', pen: 'S/',
};

const CACHE_KEY_CURRENCIES = 'sigma_converter_currencies';
const CACHE_KEY_PRICES = 'sigma_converter_prices';
const CACHE_TTL_CURRENCIES = 24 * 60 * 60 * 1000; // 24h
const CACHE_TTL_PRICES = 60 * 1000; // 60s

function getFromCache(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function detectUserCurrency() {
  try {
    const locale = navigator.language || 'en-US';
    const regionMap = {
      IN: 'inr', GB: 'gbp', JP: 'jpy', AE: 'aed',
      EU: 'eur', DE: 'eur', FR: 'eur', IT: 'eur', ES: 'eur',
      AU: 'aud', CA: 'cad', BR: 'brl', KR: 'krw', RU: 'rub',
      CN: 'cny', SG: 'sgd', HK: 'hkd', MX: 'mxn', PK: 'pkr',
    };
    const region = locale.split('-')[1]?.toUpperCase();
    return regionMap[region] || 'usd';
  } catch {
    return 'usd';
  }
}

export default function useConverter(activeSymbol) {
  // Derive initial crypto from activeSymbol (e.g. "BTCUSDT" -> "BTC")
  const initialCrypto = useMemo(() => {
    if (!activeSymbol) return 'BTC';
    const base = activeSymbol.replace('USDT', '').toUpperCase();
    return CRYPTO_MAP[base] ? base : 'BTC';
  }, [activeSymbol]);

  const [amount, setAmount] = useState('1');
  const [crypto, setCrypto] = useState(initialCrypto);
  const [currency, setCurrency] = useState(detectUserCurrency);
  const [currencies, setCurrencies] = useState(QUICK_CURRENCIES);
  const [prices, setPrices] = useState(null); // { bitcoin: { usd: 68000, inr: 5600000 } }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Sync crypto when active symbol changes
  useEffect(() => {
    const base = activeSymbol?.replace('USDT', '').toUpperCase();
    if (CRYPTO_MAP[base]) setCrypto(base);
  }, [activeSymbol]);

  // Fetch supported vs_currencies (cached 24h)
  useEffect(() => {
    const cached = getFromCache(CACHE_KEY_CURRENCIES, CACHE_TTL_CURRENCIES);
    if (cached) {
      setCurrencies(cached);
      return;
    }

    let cancelled = false;
    fetch(`${COINGECKO_BASE}/simple/supported_vs_currencies`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && Array.isArray(data)) {
          setCurrencies(data);
          setToCache(CACHE_KEY_CURRENCIES, data);
        }
      })
      .catch(() => { /* use defaults */ });

    return () => { cancelled = true; };
  }, []);

  // Fetch price for current crypto in all quick currencies + selected currency
  const fetchPrice = useCallback(async (cryptoKey) => {
    const coinId = CRYPTO_MAP[cryptoKey]?.id;
    if (!coinId) return;

    // Check cache
    const cacheKey = `${CACHE_KEY_PRICES}_${coinId}`;
    const cached = getFromCache(cacheKey, CACHE_TTL_PRICES);
    if (cached) {
      setPrices(cached);
      return;
    }

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const vsCurrencies = [...new Set([...QUICK_CURRENCIES, currency])].join(',');
      const res = await fetch(
        `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=${vsCurrencies}&include_24hr_change=true`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error('API limit reached');
      const data = await res.json();
      if (data[coinId]) {
        setPrices(data[coinId]);
        setToCache(cacheKey, data[coinId]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Rate limited — try again shortly');
      }
    } finally {
      setLoading(false);
    }
  }, [currency]);

  // Fetch on crypto/currency change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPrice(crypto), 300);
    return () => clearTimeout(debounceRef.current);
  }, [crypto, currency, fetchPrice]);

  // Computed converted value
  const convertedValue = useMemo(() => {
    if (!prices || !amount) return null;
    const rate = prices[currency];
    if (rate == null) return null;
    const num = parseFloat(amount);
    if (isNaN(num)) return null;
    return num * rate;
  }, [amount, prices, currency]);

  // 24h change for the selected currency
  const change24h = useMemo(() => {
    if (!prices) return null;
    return prices[`${currency}_24h_change`] ?? null;
  }, [prices, currency]);

  // Format the converted value nicely
  const formattedValue = useMemo(() => {
    if (convertedValue == null) return '—';
    const sym = CURRENCY_SYMBOLS[currency] || currency.toUpperCase() + ' ';

    if (Math.abs(convertedValue) >= 1e7) {
      // Show in lakhs/millions format
      if (currency === 'inr' && Math.abs(convertedValue) >= 1e5) {
        const lakhs = convertedValue / 1e5;
        return `${sym}${lakhs.toFixed(2)}L`;
      }
      return `${sym}${(convertedValue / 1e6).toFixed(2)}M`;
    }

    return `${sym}${convertedValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: convertedValue < 1 ? 8 : 2,
    })}`;
  }, [convertedValue, currency]);

  return {
    amount, setAmount,
    crypto, setCrypto,
    currency, setCurrency,
    currencies,
    prices,
    loading, error,
    convertedValue,
    formattedValue,
    change24h,
    cryptoList: CRYPTO_LIST,
    cryptoMap: CRYPTO_MAP,
    quickCurrencies: QUICK_CURRENCIES,
    currencySymbols: CURRENCY_SYMBOLS,
  };
}
