'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { CTRDataPoint } from '../lib/types'

interface Props {
  data: CTRDataPoint[]
  baseline: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-2 text-xs"
        style={{ background: '#0A1628', border: '1px solid rgba(0,194,255,0.3)', color: '#E2E8F0' }}>
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {(p.value * 100).toFixed(1)}%
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function CTRChart({ data, baseline }: Props) {
  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-white">CTR Evolution</div>
        {data.length > 0 && (
          <div className="text-xs font-bold" style={{ color: '#00E5A0' }}>
            {(data[data.length - 1].ctr * 100).toFixed(1)}% current
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-28 flex items-center justify-center text-slate-600 text-xs">
          Run a pipeline to see CTR data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ctrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={baseline} stroke="#FF3B5C" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="ctr" stroke="#00C2FF" strokeWidth={2}
              fill="url(#ctrGrad)" name="CTR" dot={{ fill: '#00C2FF', r: 2 }} />
            {data.some(d => d.predicted !== undefined) && (
              <Area type="monotone" dataKey="predicted" stroke="#7C3AED" strokeWidth={1.5}
                strokeDasharray="4 2" fill="url(#predictGrad)" name="Predicted" dot={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex gap-3 mt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ background: '#00C2FF' }} />
          <span className="text-[10px] text-slate-500">CTR</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ background: '#FF3B5C', borderTop: '1px dashed' }} />
          <span className="text-[10px] text-slate-500">Baseline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded" style={{ background: '#7C3AED', borderTop: '2px dashed' }} />
          <span className="text-[10px] text-slate-500">Predicted</span>
        </div>
      </div>
    </div>
  )
}
