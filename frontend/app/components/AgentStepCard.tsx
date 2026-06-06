'use client'
import { AgentStatus } from '../lib/types'

interface Props {
  index: number
  title: string
  icon: string
  status: AgentStatus
  data?: Record<string, unknown>
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const configs: Record<AgentStatus, { label: string; color: string; bg: string }> = {
    idle:    { label: 'IDLE',     color: '#475569', bg: 'rgba(71,85,105,0.15)' },
    running: { label: 'RUNNING',  color: '#00C2FF', bg: 'rgba(0,194,255,0.15)' },
    done:    { label: 'DONE',     color: '#00E5A0', bg: 'rgba(0,229,160,0.15)' },
    fail:    { label: 'FAIL',     color: '#FF3B5C', bg: 'rgba(255,59,92,0.15)' },
    fixing:  { label: 'FIXING',   color: '#FFB800', bg: 'rgba(255,184,0,0.15)' },
    passed:  { label: 'PASSED',   color: '#00E5A0', bg: 'rgba(0,229,160,0.15)' },
    evolved: { label: 'EVOLVED',  color: '#9D5FF7', bg: 'rgba(157,95,247,0.15)' },
  }
  const { label, color, bg } = configs[status]
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
      {status === 'running' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />}
      {label}
    </span>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs py-0.5">
      <span className="text-slate-500 flex-shrink-0 w-28">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  )
}

function renderData(data: Record<string, unknown>) {
  const rows: Array<[string, string]> = []
  for (const [k, v] of Object.entries(data)) {
    if (k === 'tool_called') continue
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      rows.push([k.replace(/_/g, ' '), String(v)])
    } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
      rows.push([k.replace(/_/g, ' '), v.join(', ')])
    }
  }
  return rows.slice(0, 6)
}

export default function AgentStepCard({ index, title, icon, status, data }: Props) {
  const borderColors: Record<AgentStatus, string> = {
    idle:    'border-white/5',
    running: 'border-neon/50',
    done:    'border-green/40',
    fail:    'border-red/50',
    fixing:  'border-yellow/40',
    passed:  'border-green/50',
    evolved: 'border-purple/50',
  }

  const glowStyles: Record<AgentStatus, string> = {
    idle:    '',
    running: '0 0 12px rgba(0,194,255,0.2)',
    done:    '0 0 8px rgba(0,229,160,0.15)',
    fail:    '0 0 20px rgba(255,59,92,0.3)',
    fixing:  '0 0 10px rgba(255,184,0,0.2)',
    passed:  '0 0 16px rgba(0,229,160,0.25)',
    evolved: '0 0 16px rgba(124,58,237,0.3)',
  }

  const animClass = status === 'fail' ? 'animate-[shake_0.5s_ease-in-out]' : ''

  return (
    <div
      className={`
        rounded-xl p-3.5 mb-2.5 transition-all duration-300
        bg-navy/60 border backdrop-blur-sm
        ${borderColors[status]} ${animClass}
      `}
      style={{ boxShadow: glowStyles[status] }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">{title}</span>
              {status === 'evolved' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background: 'rgba(124,58,237,0.3)', color: '#9D5FF7' }}>EVOLVED</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">Agent {index}</div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Running spinner bar */}
      {status === 'running' && (
        <div className="h-0.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full animate-[shimmer_1.5s_linear_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #00C2FF 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              width: '60%',
              animation: 'shimmer-bar 1.5s linear infinite',
            }} />
        </div>
      )}

      {/* Compliance sweep bar */}
      {status === 'fixing' && (
        <div className="h-0.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,184,0,0.1)' }}>
          <div className="h-full rounded-full"
            style={{ background: '#FFB800', width: '70%', transition: 'width 0.8s ease' }} />
        </div>
      )}

      {/* Data content */}
      {data && status !== 'idle' && (
        <div className="mt-1 space-y-0.5 border-t border-white/5 pt-2">
          {renderData(data).map(([label, value]) => (
            <DataRow key={label} label={label} value={value} />
          ))}
          {!!data.tool_called && (
            <div className="flex items-center gap-1.5 mt-2 bg-neon/10 border border-neon/30 text-neon px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit animate-pulse">
              <span>🛠️ Tool Call:</span>
              <span className="uppercase tracking-wider">{String(data.tool_called)}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty idle state */}
      {status === 'idle' && (
        <div className="text-xs text-slate-600 mt-1">Waiting for trigger...</div>
      )}
    </div>
  )
}
