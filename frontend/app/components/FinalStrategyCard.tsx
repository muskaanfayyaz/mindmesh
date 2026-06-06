'use client'
import { DoneData } from '../lib/types'

interface Props {
  data: DoneData
  isEvolved?: boolean
}

export default function FinalStrategyCard({ data, isEvolved }: Props) {
  return (
    <div className={`rounded-xl p-4 mt-3 ${isEvolved ? 'status-evolved' : ''}`}
      style={{
        background: isEvolved
          ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,194,255,0.1))'
          : 'rgba(0,194,255,0.06)',
        border: isEvolved
          ? '1px solid rgba(124,58,237,0.4)'
          : '1px solid rgba(0,194,255,0.3)',
        boxShadow: isEvolved
          ? '0 0 24px rgba(124,58,237,0.2)'
          : '0 0 16px rgba(0,194,255,0.1)',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isEvolved ? '🔄' : '✅'}</span>
          <div>
            <div className="text-sm font-bold text-white">
              {isEvolved ? 'Evolved Strategy' : 'Final Strategy'}
            </div>
            <div className="text-xs font-semibold" style={{ color: isEvolved ? '#9D5FF7' : '#00C2FF' }}>
              {data.final_strategy}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: '#00E5A0' }}>
            {(data.predicted_ctr * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">Predicted CTR</div>
        </div>
      </div>

      {/* Ad copy */}
      <div className="rounded-lg p-3 mb-3"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Ad Copy</div>
        <p className="text-sm text-slate-100 leading-relaxed">{data.final_copy}</p>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg p-2 text-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-[10px] text-slate-500 mb-0.5">Channel</div>
          <div className="text-xs font-semibold text-white truncate">{data.channel}</div>
        </div>
        <div className="rounded-lg p-2 text-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-[10px] text-slate-500 mb-0.5">Confidence</div>
          <div className="text-xs font-semibold" style={{ color: '#00E5A0' }}>
            {(data.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className="rounded-lg p-2 text-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-[10px] text-slate-500 mb-0.5">Persona</div>
          <div className="text-xs font-semibold text-white truncate" title={data.persona}>
            {data.persona.split(' ').slice(0, 2).join(' ')}
          </div>
        </div>
      </div>
    </div>
  )
}
