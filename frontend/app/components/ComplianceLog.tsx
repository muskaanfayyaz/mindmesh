'use client'

interface LogEntry {
  timestamp: string
  status: 'pass' | 'fail' | 'fix'
  message: string
  user?: string
}

interface Props {
  entries: LogEntry[]
}

export default function ComplianceLog({ entries }: Props) {
  const icons = { pass: '✅', fail: '🚫', fix: '🔧' }
  const colors = {
    pass: { text: '#00E5A0', bg: 'rgba(0,229,160,0.08)' },
    fail: { text: '#FF3B5C', bg: 'rgba(255,59,92,0.08)' },
    fix:  { text: '#FFB800', bg: 'rgba(255,184,0,0.08)' },
  }

  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-xs font-semibold text-white">Compliance Log</div>
        <span className="text-[10px] text-slate-500">{entries.length} events</span>
      </div>

      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-xs text-slate-600 text-center py-2">No events yet</div>
        ) : (
          [...entries].reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg p-2 text-xs"
              style={{ background: colors[entry.status].bg }}>
              <span className="text-sm flex-shrink-0">{icons[entry.status]}</span>
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: colors[entry.status].text }}>
                  {entry.user && <span className="text-slate-400">{entry.user} — </span>}
                  {entry.message}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">{entry.timestamp}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export type { LogEntry }
