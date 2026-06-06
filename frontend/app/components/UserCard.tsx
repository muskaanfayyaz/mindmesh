'use client'
import { User } from '../lib/types'
import { getInterestEmoji, getDeviceIcon, getCTRColor } from '../lib/api'

interface Props {
  user: User
  isSelected: boolean
  onSelect: (user: User) => void
}

export default function UserCard({ user, isSelected, onSelect }: Props) {
  const ctrColor = getCTRColor(user.click_through_rate)
  const ctrPct = (user.click_through_rate * 100).toFixed(0)

  return (
    <div
      onClick={() => onSelect(user)}
      className={`
        relative cursor-pointer rounded-xl p-3 mb-2 transition-all duration-200
        border backdrop-blur-sm
        ${isSelected
          ? 'bg-navy border-neon/60 shadow-[0_0_16px_rgba(0,194,255,0.25)]'
          : 'bg-navy/50 border-white/5 hover:border-neon/30 hover:bg-navy/80'
        }
      `}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-neon" />
      )}
      <div className="flex items-start justify-between gap-2">
        {/* Avatar + info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)' }}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white truncate">{user.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {user.age}y · {user.city} · {getDeviceIcon(user.device)}
            </div>
          </div>
        </div>
        {/* CTR badge */}
        <div className="flex-shrink-0 text-right">
          <div className="text-xs font-bold" style={{ color: ctrColor }}>{ctrPct}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">CTR</div>
        </div>
      </div>

      {/* Interest + income tags */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(0,194,255,0.1)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.2)' }}>
          {getInterestEmoji(user.primary_interest)} {user.primary_interest}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: user.income_level === 'High' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
            color: user.income_level === 'High' ? '#9D5FF7' : '#94A3B8',
            border: `1px solid ${user.income_level === 'High' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`
          }}>
          {user.income_level}
        </span>
      </div>
    </div>
  )
}
