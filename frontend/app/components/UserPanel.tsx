'use client'
import { useState, useEffect, useMemo } from 'react'
import { User } from '../lib/types'
import { fetchUsers } from '../lib/api'
import UserCard from './UserCard'

interface Props {
  selectedUser: User | null
  onSelectUser: (user: User) => void
}

const CITIES = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi']
const DEVICES = ['All', 'Mobile', 'Desktop', 'Tablet']

export default function UserPanel({ selectedUser, onSelectUser }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All')
  const [device, setDevice] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(d => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = users
    if (search) result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.primary_interest.toLowerCase().includes(search.toLowerCase())
    )
    if (city !== 'All') result = result.filter(u => u.city === city)
    if (device !== 'All') result = result.filter(u => u.device === device)
    return result
  }, [search, city, device, users])

  return (
    <div className="w-72 flex-shrink-0 flex flex-col h-full border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Audience</h2>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,194,255,0.1)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.2)' }}>
            {filtered.length} users
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E2E8F0',
            }}
          />
        </div>

        {/* City filter */}
        <div className="mb-2">
          <div className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">City</div>
          <div className="flex flex-wrap gap-1">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: city === c ? 'rgba(0,194,255,0.2)' : 'rgba(255,255,255,0.04)',
                  color: city === c ? '#00C2FF' : '#64748B',
                  border: `1px solid ${city === c ? 'rgba(0,194,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Device filter */}
        <div>
          <div className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">Device</div>
          <div className="flex gap-1">
            {DEVICES.map(d => (
              <button key={d} onClick={() => setDevice(d)}
                className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: device === d ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                  color: device === d ? '#9D5FF7' : '#64748B',
                  border: `1px solid ${device === d ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="text-center text-slate-500 text-xs mt-8">Loading 50 profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-500 text-xs mt-8">No users found</div>
        ) : (
          filtered.map(user => (
            <UserCard
              key={user.user_id}
              user={user}
              isSelected={selectedUser?.user_id === user.user_id}
              onSelect={onSelectUser}
            />
          ))
        )}
      </div>
    </div>
  )
}
