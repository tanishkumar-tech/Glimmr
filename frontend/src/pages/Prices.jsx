import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Prices = () => {
  const [points, setPoints] = useState([]);
  const [last, setLast] = useState(null);
  const [currency, setCurrency] = useState('inr');
  const [metal, setMetal] = useState('gold'); // 'gold' or 'silver'
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchPrices = useCallback(async () => {
      try {
        const res = await axios.get(`/api/prices?currency=${currency}`);
        const payload = res.data || {};
        setLast(payload);
        setPoints(prev => {
          const next = [
            ...prev,
          {
            t: payload.timestamp || new Date().toISOString(),
            g24: payload.gold_10g_24k ?? 0,
            g22: payload.gold_10g_22k ?? 0,
            g18: payload.gold_10g_18k ?? 0,
            s10: payload.silver && payload.silver.price ? Math.round(Number(payload.silver.price) * 10) : 0,
          },
          ];
          // Keep last 50 points to avoid memory growth
          return next.slice(-50);
        });
      } catch (e) {
        // silently ignore, keep previous points
      }
    }, [currency]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // 1 min
    return () => clearInterval(interval);
  }, [currency, fetchPrices]);

  const dataGold = {
    labels: points.map(p => new Date(p.t).toLocaleTimeString()),
    datasets: [
      {
        label: '24K Gold (10g, INR)',
        data: points.map(p => p.g24 || 0),
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: '22K Gold (10g, INR)',
        data: points.map(p => p.g22 || 0),
        borderColor: '#B8860B',
        backgroundColor: 'rgba(184, 134, 11, 0.12)',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: '18K Gold (10g, INR)',
        data: points.map(p => p.g18 || 0),
        borderColor: '#8B8000',
        backgroundColor: 'rgba(139, 128, 0, 0.10)',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
    ],
  };

  const dataSilver = {
    labels: points.map(p => new Date(p.t).toLocaleTimeString()),
    datasets: [
      {
        label: 'Silver (10g, ' + currency.toUpperCase() + ')',
        data: points.map(p => p.s10 || 0),
        borderColor: '#A0A0A0',
        backgroundColor: 'rgba(160,160,160,0.15)',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#4B5563',
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#FDE68A',
        bodyColor: '#F9FAFB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y || 0;
            return `${ctx.dataset.label}: ${v.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(253, 230, 138, 0.15)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(253, 230, 138, 0.15)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Real-time Prices</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Currency</label>
          <select
            value={currency}
            onChange={(e) => { setPoints([]); setCurrency(e.target.value); }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="inr">INR</option>
            <option value="gbp">GBP</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Metal</label>
          <select
            value={metal}
            onChange={(e) => { setPoints([]); setMetal(e.target.value); fetchPrices(); }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
        </div>
        {/* Source selection removed: backend uses GoldAPI only */}
        <p className="text-sm text-gray-600">
          {metal === 'gold' ?
            <>Chart: 10g gold price in {currency.toUpperCase()} for 24K, 22K, 18K</> :
            <>Chart: 10g silver price in {currency.toUpperCase()}</>
          } {last?.timestamp ? `(Last updated: ${new Date(last.timestamp).toLocaleString()})` : ''} {last?.provider ? `• Source: ${last.provider}` : ''}
        </p>
        {last?.provider && (
          <span className={`text-xs px-2 py-1 rounded border ${last.provider === 'goldapi' ? 'border-green-300 text-green-700 bg-green-50' : 'border-yellow-300 text-yellow-700 bg-yellow-50'}`}>
            Provider: {last.provider === 'goldapi' ? 'GoldAPI' : 'Fallback'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setPoints([]); fetchPrices(); }}
          className="border border-amber-200 bg-white hover:bg-amber-50 text-gray-700 px-3 py-1 rounded"
        >
          Refresh
        </button>
        {metal === 'silver' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Silver (10g) data sourced from GoldAPI XAG dated endpoint</span>
            <button
              onClick={async () => {
                try {
                  const res = await api.post('/admin/recalc-silver');
                  toastSuccess(`Recalculated ${res.data.updated}/${res.data.total} at ₹${(res.data.perGram||0).toLocaleString('en-IN')} /g`);
                } catch (e) {
                  toastError(e.response?.data?.error || 'Failed to recalculate silver prices');
                }
              }}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded text-xs"
            >
              Recalculate Silver Prices
            </button>
          </div>
        )}
      </div>
      {metal === 'gold' ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100 mb-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-gray-500 text-xs">24K (10g, {currency.toUpperCase()})</div>
            <div className="text-3xl font-bold text-amber-600">{(last?.gold_10g_24k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">22K (10g, {currency.toUpperCase()})</div>
            <div className="text-3xl font-bold text-amber-700">{(last?.gold_10g_22k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">18K (10g, {currency.toUpperCase()})</div>
            <div className="text-3xl font-bold text-amber-800">{(last?.gold_10g_18k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}</div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-6 grid grid-cols-1 gap-6">
          <div>
            <div className="text-gray-500 text-xs">Silver (10g, {currency.toUpperCase()})</div>
            <div className="text-3xl font-bold text-gray-600">{(last?.silver && last.silver.price ? Math.round(Number(last.silver.price) * 10) : 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}</div>
          </div>
        </div>
      )}
      <div className="relative rounded-3xl p-4 bg-gradient-to-br from-amber-50 via-white to-rose-50 border border-amber-100 shadow-xl" style={{ height: 420 }}>
        <div className="absolute -top-6 left-6 text-5xl opacity-20">💎</div>
        <div className="absolute -bottom-6 right-6 text-5xl opacity-20">✨</div>
        <Line key={metal + '-' + currency} data={metal === 'gold' ? dataGold : dataSilver} options={options} />
      </div>
    </div>
  );
};

export default Prices;
