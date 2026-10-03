import { useState, useEffect } from 'react';
import Card, { CardHeader } from '../common/Card';
import Badge from '../common/Badge';
import { alertApi } from '../../services/market.api';

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertApi.getAlerts({ active: true });
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const severityVariant = (s) => s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'info';

  const handleAck = async (id) => {
    try {
      await alertApi.acknowledge(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Ack failed:', err.message);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Alerts" subtitle={`${alerts.length} active`} />
      <div className="flex-1 overflow-y-auto space-y-2">
        {alerts.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-4 italic">No active alerts</p>
        ) : (
          alerts.slice(0, 20).map((alert, i) => (
            <div key={alert._id || i} className="flex items-start gap-2 p-2 bg-[var(--color-bg-primary)] rounded-lg group animate-fade-in">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono font-semibold text-[var(--color-text-primary)]">{alert.symbol}</span>
                  <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed truncate">{alert.condition}</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                  {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : ''}
                </p>
              </div>
              <button
                onClick={() => handleAck(alert._id)}
                className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-[10px] transition-all shrink-0"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
