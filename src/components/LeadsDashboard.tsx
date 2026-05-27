import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp, TrendingDown, Users, Target, CheckCircle,
  RefreshCw, Calendar, X, BarChart2, Activity, ChevronUp, ChevronDown
} from 'lucide-react';

interface DailyPoint {
  date: string;
  total: number;
  converted: number;
  interested: number;
  not_interested: number;
  not_answered: number;
  called: number;
  callback: number;
  new: number;
}

interface ExecutiveStat {
  name: string;
  total: number;
  converted: number;
  interested: number;
  today: number;
}

interface Props {
  isAdmin?: boolean;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  converted: '#22c55e',
  interested: '#f59e0b',
  called: '#64748b',
  callback: '#a855f7',
  not_interested: '#ef4444',
  not_answered: '#f97316',
  new: '#38bdf8',
};

const CHART_HEIGHT = 160;
const CHART_PADDING = { top: 16, bottom: 24, left: 36, right: 12 };

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const w = 80;
  const h = 32;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function StockChart({ data, metric }: { data: DailyPoint[]; metric: keyof DailyPoint }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DailyPoint } | null>(null);
  const values = data.map(d => Number(d[metric]));
  const max = Math.max(...values, 1);
  const chartW = 100;
  const chartH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const color = metric === 'total' ? '#f59e0b' : metric === 'converted' ? '#22c55e' : metric === 'interested' ? '#38bdf8' : '#f59e0b';

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data for selected range</div>
  );

  const pts = data.map((d, i) => {
    const x = CHART_PADDING.left + (i / Math.max(data.length - 1, 1)) * (chartW - CHART_PADDING.left - CHART_PADDING.right) * (100 / 100);
    const y = CHART_PADDING.top + chartH - (Number(d[metric]) / max) * chartH;
    return { x, y, d };
  });

  const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaClose = `${pts[pts.length - 1].x},${CHART_PADDING.top + chartH} ${pts[0].x},${CHART_PADDING.top + chartH}`;
  const areaPts = polyPts + ' ' + areaClose;

  const gridLines = 4;

  return (
    <div className="relative select-none" style={{ height: CHART_HEIGHT }}>
      <svg
        viewBox={`0 0 ${chartW + CHART_PADDING.left} ${CHART_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setTooltip(null)}
      >
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const yVal = Math.round((max * (gridLines - i)) / gridLines);
          const y = CHART_PADDING.top + (i / gridLines) * chartH;
          return (
            <g key={i}>
              <line x1={CHART_PADDING.left} x2={chartW + CHART_PADDING.left} y1={y} y2={y} stroke="#1e293b" strokeWidth="0.5" />
              <text x={CHART_PADDING.left - 4} y={y + 3} textAnchor="end" fill="#475569" fontSize="5">{yVal}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPts} fill={`url(#grad-${metric})`} />
        <polyline points={polyPts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} opacity="0" className="cursor-pointer"
            onMouseEnter={e => {
              const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
              const svgW = rect.width;
              const pctX = p.x / (chartW + CHART_PADDING.left);
              setTooltip({ x: pctX * svgW, y: (p.y / CHART_HEIGHT) * rect.height, point: p.d });
            }}
            style={{ pointerEvents: 'all', opacity: 0 }}
          >
            <title>{p.d.date}: {Number(p.d[metric])}</title>
          </circle>
        ))}
        {pts.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="1.8" fill={color} stroke="#0f172a" strokeWidth="1" />
        ))}
        {data.length <= 14 && pts.map((p, i) => (
          <text key={`lbl-${i}`} x={p.x} y={CHART_HEIGHT - 6} textAnchor="middle" fill="#475569" fontSize="4.5">
            {new Date(p.d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).replace(' ', '\n')}
          </text>
        ))}
        {data.length > 14 && [0, Math.floor(data.length / 2), data.length - 1].map(i => (
          <text key={`lbl-${i}`} x={pts[i].x} y={CHART_HEIGHT - 6} textAnchor="middle" fill="#475569" fontSize="4.5">
            {new Date(pts[i].d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </text>
        ))}
      </svg>
      {tooltip && (
        <div className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs z-10 shadow-xl"
          style={{ left: Math.min(tooltip.x + 12, 200), top: Math.max(tooltip.y - 40, 0) }}>
          <p className="text-white font-semibold mb-1">{new Date(tooltip.point.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="text-amber-400">New: <span className="text-white">{tooltip.point.new}</span></p>
          <p className="text-green-400">Converted: <span className="text-white">{tooltip.point.converted}</span></p>
          <p className="text-sky-400">Interested: <span className="text-white">{tooltip.point.interested}</span></p>
          <p className="text-orange-400">Not Answered: <span className="text-white">{tooltip.point.not_answered}</span></p>
        </div>
      )}
    </div>
  );
}

function ExecutiveChart({ executives }: { executives: ExecutiveStat[] }) {
  const sorted = [...executives].sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...sorted.map(e => e.total), 1);

  if (sorted.length === 0) return (
    <div className="text-center py-8 text-slate-500 text-sm">No executive data available</div>
  );

  return (
    <div className="space-y-3">
      {sorted.map((ex, i) => {
        const convRate = ex.total > 0 ? Math.round((ex.converted / ex.total) * 100) : 0;
        const intRate = ex.total > 0 ? Math.round((ex.interested / ex.total) * 100) : 0;
        return (
          <div key={i} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                  {ex.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{ex.name}</p>
                  <p className="text-slate-500 text-xs">Today: <span className="text-amber-400 font-medium">{ex.today}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-green-400 text-sm font-bold">{ex.converted}</p>
                  <p className="text-slate-600 text-xs">conv.</p>
                </div>
                <div>
                  <p className="text-amber-400 text-sm font-bold">{ex.total}</p>
                  <p className="text-slate-600 text-xs">total</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-500">Leads</span>
                  <span className="text-slate-400">{ex.total}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${(ex.total / maxTotal) * 100}%` }} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-slate-500">Interested</span>
                    <span className="text-sky-400">{intRate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${intRate}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-slate-500">Converted</span>
                    <span className="text-green-400">{convRate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${convRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeadsDashboard({ isAdmin = false }: Props) {
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [executives, setExecutives] = useState<ExecutiveStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [chartMetric, setChartMetric] = useState<keyof DailyPoint>('total');
  const [todayCount, setTodayCount] = useState(0);
  const [totalInRange, setTotalInRange] = useState(0);
  const [totalConverted, setTotalConverted] = useState(0);
  const [totalInterested, setTotalInterested] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const from = dateFrom + 'T00:00:00';
    const to = dateTo + 'T23:59:59';

    const [leadsRes, usersRes] = await Promise.all([
      supabase.from('marketing_leads')
        .select('id, status, created_at, collected_by, executive_user_id')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: true }),
      supabase.from('app_users')
        .select('id, full_name, role')
        .eq('role', 'marketing_executive')
        .eq('is_active', true),
    ]);

    const leads = leadsRes.data || [];
    const users = usersRes.data || [];

    const today = new Date().toISOString().slice(0, 10);
    setTodayCount(leads.filter(l => l.created_at.slice(0, 10) === today).length);
    setTotalInRange(leads.length);
    setTotalConverted(leads.filter(l => l.status === 'converted').length);
    setTotalInterested(leads.filter(l => l.status === 'interested').length);

    const dayMap = new Map<string, DailyPoint>();
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { date: key, total: 0, converted: 0, interested: 0, not_interested: 0, not_answered: 0, called: 0, callback: 0, new: 0 });
    }

    leads.forEach(l => {
      const key = l.created_at.slice(0, 10);
      const pt = dayMap.get(key);
      if (!pt) return;
      pt.total = pt.total + 1;
      const s = l.status as keyof DailyPoint;
      if (s in pt) (pt[s] as number) = (pt[s] as number) + 1;
    });

    setDailyData(Array.from(dayMap.values()));

    const today2 = new Date().toISOString().slice(0, 10);
    const execStats: ExecutiveStat[] = users.map(u => {
      const myLeads = leads.filter(l => l.executive_user_id === u.id);
      return {
        name: u.full_name,
        total: myLeads.length,
        converted: myLeads.filter(l => l.status === 'converted').length,
        interested: myLeads.filter(l => l.status === 'interested').length,
        today: myLeads.filter(l => l.created_at.slice(0, 10) === today2).length,
      };
    });
    setExecutives(execStats.filter(e => e.total > 0));

    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const todaySpark = dailyData.slice(-7).map(d => d.total);
  const prevPeriodTotal = dailyData.slice(0, Math.floor(dailyData.length / 2)).reduce((s, d) => s + d.total, 0);
  const currPeriodTotal = dailyData.slice(Math.floor(dailyData.length / 2)).reduce((s, d) => s + d.total, 0);
  const trend = prevPeriodTotal > 0 ? Math.round(((currPeriodTotal - prevPeriodTotal) / prevPeriodTotal) * 100) : 0;
  const convRate = totalInRange > 0 ? ((totalConverted / totalInRange) * 100).toFixed(1) : '0.0';

  const metricOptions: { key: keyof DailyPoint; label: string; color: string }[] = [
    { key: 'total', label: 'All Leads', color: '#f59e0b' },
    { key: 'new', label: 'New', color: '#38bdf8' },
    { key: 'interested', label: 'Interested', color: '#f59e0b' },
    { key: 'converted', label: 'Converted', color: '#22c55e' },
    { key: 'not_answered', label: 'Not Answered', color: '#f97316' },
    { key: 'callback', label: 'Callback', color: '#a855f7' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Leads Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Interactive analytics — stock market style</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            <span className="text-slate-500 text-xs">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none" />
          </div>
          <button onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Today\'s Leads', value: todayCount,
            icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
            spark: todaySpark, sparkColor: '#f59e0b',
          },
          {
            label: 'Total in Range', value: totalInRange,
            icon: BarChart2, color: 'text-white', bg: 'bg-slate-700/60 border-slate-600/30',
            spark: dailyData.map(d => d.total), sparkColor: '#94a3b8',
            badge: trend !== 0 ? { v: trend, up: trend > 0 } : null,
          },
          {
            label: 'Interested', value: totalInterested,
            icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20',
            spark: dailyData.map(d => d.interested), sparkColor: '#38bdf8',
          },
          {
            label: 'Converted', value: totalConverted,
            icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20',
            spark: dailyData.map(d => d.converted), sparkColor: '#22c55e',
            sub: `${convRate}% rate`,
          },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`border ${s.bg} rounded-2xl p-5 relative overflow-hidden`}>
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                {(s as any).badge && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${(s as any).badge.up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {(s as any).badge.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {Math.abs((s as any).badge.v)}%
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${s.color} mb-0.5`}>{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
              {(s as any).sub && <p className="text-slate-500 text-xs mt-0.5">{(s as any).sub}</p>}
              <div className="absolute bottom-3 right-3">
                <MiniSparkline points={s.spark.slice(-14)} color={s.sparkColor} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Lead Flow Chart</h3>
            <span className="text-slate-500 text-xs">({dailyData.length} days)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metricOptions.map(m => (
              <button key={m.key} onClick={() => setChartMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  chartMetric === m.key
                    ? 'text-white border-transparent'
                    : 'border-slate-700 text-slate-500 hover:text-slate-300 bg-transparent'
                }`}
                style={chartMetric === m.key ? { backgroundColor: m.color + '33', borderColor: m.color + '55', color: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <StockChart data={dailyData} metric={chartMetric} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Executive Performance</h3>
          </div>
          <ExecutiveChart executives={executives} />
          {executives.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">No executive lead data in this period</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(STATUS_COLOR_MAP).map(([status, color]) => {
              const count = dailyData.reduce((s, d) => s + (Number((d as any)[status]) || 0), 0);
              const pct = totalInRange > 0 ? (count / totalInRange) * 100 : 0;
              const label = status === 'not_interested' ? 'Not Interested'
                : status === 'not_answered' ? 'Not Answered'
                : status.charAt(0).toUpperCase() + status.slice(1);
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-white font-medium">{count} <span className="text-slate-500">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h3 className="text-white font-semibold">Daily Breakdown</h3>
          <span className="text-slate-500 text-xs ml-auto">Latest {Math.min(dailyData.length, 10)} days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Date', 'Total', 'New', 'Interested', 'Converted', 'Not Ans.', 'Callback'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-500 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...dailyData].reverse().slice(0, 10).map((d, i) => (
                <tr key={i} className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30`}>
                  <td className="py-2.5 px-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {d.date === new Date().toISOString().slice(0, 10) && (
                      <span className="ml-2 text-amber-400 text-xs font-medium">Today</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-white font-semibold">{d.total}</td>
                  <td className="py-2.5 px-3 text-sky-400">{d.new}</td>
                  <td className="py-2.5 px-3 text-amber-400">{d.interested}</td>
                  <td className="py-2.5 px-3 text-green-400">{d.converted}</td>
                  <td className="py-2.5 px-3 text-orange-400">{d.not_answered}</td>
                  <td className="py-2.5 px-3 text-slate-400">{d.callback}</td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
