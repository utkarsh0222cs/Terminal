import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { useTheme } from '../../context/ThemeContext';

export default function CandlestickChart({ data, loading }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const { isDark } = useTheme();

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-text').trim() || '#9ca3af',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-grid').trim() || 'rgba(30, 34, 53, 0.6)' },
        horzLines: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-grid').trim() || 'rgba(30, 34, 53, 0.6)' },
      },
      crosshair: {
        vertLine: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-crosshair').trim() || 'rgba(99, 102, 241, 0.3)', width: 1, style: 2 },
        horzLine: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-crosshair').trim() || 'rgba(99, 102, 241, 0.3)', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-border').trim() || 'rgba(30, 34, 53, 0.8)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-border').trim() || 'rgba(30, 34, 53, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update chart colors on theme change
  useEffect(() => {
    if (!chartRef.current) return;

    const root = document.documentElement;
    const cs = getComputedStyle(root);

    chartRef.current.applyOptions({
      layout: {
        textColor: cs.getPropertyValue('--color-chart-text').trim() || '#9ca3af',
      },
      grid: {
        vertLines: { color: cs.getPropertyValue('--color-chart-grid').trim() },
        horzLines: { color: cs.getPropertyValue('--color-chart-grid').trim() },
      },
      crosshair: {
        vertLine: { color: cs.getPropertyValue('--color-chart-crosshair').trim(), width: 1, style: 2 },
        horzLine: { color: cs.getPropertyValue('--color-chart-crosshair').trim(), width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: cs.getPropertyValue('--color-chart-border').trim(),
      },
      timeScale: {
        borderColor: cs.getPropertyValue('--color-chart-border').trim(),
      },
    });
  }, [isDark]);

  // Set data
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;

    try {
      const seen = new Set();
      const unique = data
        .filter(d => {
          if (!d || !d.time) return false;
          if (seen.has(d.time)) return false;
          seen.add(d.time);
          return true;
        })
        .sort((a, b) => a.time - b.time);

      if (unique.length > 0) {
        seriesRef.current.setData(unique);
        chartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Chart data error:', err);
    }
  }, [data]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '250px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--color-chart-overlay-bg)' }}>
          <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
