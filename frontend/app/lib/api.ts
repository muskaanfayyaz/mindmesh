import { User } from './types'
import { InterestAd, AdSlot } from './adCatalog'

export async function fetchUsers(search?: string, city?: string, device?: string): Promise<{ users: User[] }> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  let url = `${API_BASE_URL}/api/users?`
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (city && city !== 'All') params.append('city', city)
  if (device && device !== 'All') params.append('device', device)
  
  const res = await fetch(url + params.toString())
  if (!res.ok) {
    throw new Error('Failed to fetch users')
  }
  return res.json()
}

export async function sendInterestAdEmail(user: User, brand: string, ad: InterestAd, slot: AdSlot) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const res = await fetch(`${API_BASE_URL}/api/send-interest-ad-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: user.user_id,
      brand,
      ad_id: ad.id,
      ad_name: ad.name,
      ad_copy: ad.copy,
      genre: ad.genre,
      slot
    })
  })

  if (!res.ok) {
    throw new Error('Failed to send ad email')
  }

  return res.json() as Promise<{
    sent: boolean
    delivery: 'smtp' | 'outbox'
    recipient: string
    ad_id: string
    smtp_error?: string | null
  }>
}

export function getInterestEmoji(interest: string): string {
  const map: Record<string, string> = {
    food: '🍔',
    gaming: '🎮',
    fashion: '🛍️',
    education: '📚',
    sports: '⚽',
    travel: '✈️',
    tech: '💻',
    business: '💼',
    blogging: '✍️',
    crypto: '🪙',
    health: '🏥'
  }
  return map[interest.toLowerCase()] || '✨'
}

export function getDeviceIcon(device: string): string {
  const map: Record<string, string> = {
    smartphone: '📱',
    mobile: '📱',
    desktop: '💻',
    desktop_windows: '💻',
    laptop: '💻',
    tablet: '📟',
    tablet_mac: '📟'
  }
  return map[device.toLowerCase()] || '💻'
}

export function getCTRColor(ctr: number): string {
  if (ctr >= 0.25) return '#00E5A0'
  if (ctr >= 0.15) return '#00C2FF'
  if (ctr >= 0.08) return '#FFB800'
  return '#FF3B5C'
}
