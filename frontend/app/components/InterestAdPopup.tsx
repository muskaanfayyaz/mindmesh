'use client'
import Image from 'next/image'
import { User } from '../lib/types'
import { getInterestEmoji } from '../lib/api'
import { InterestAd, AdSlot } from '../lib/adCatalog'

interface Props {
  user: User
  brand: string
  ad: InterestAd
  activeSlot: AdSlot
  onInterested: () => void
  onNotInterested: () => void
  onClose: () => void
}

function createAdImage(ad: InterestAd, brand: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#071326"/>
          <stop offset="55%" stop-color="#0A1628"/>
          <stop offset="100%" stop-color="${ad.accent}"/>
        </linearGradient>
        <radialGradient id="glow" cx="28%" cy="24%" r="60%">
          <stop offset="0%" stop-color="${ad.accent}" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="${ad.accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="960" height="540" fill="url(#bg)"/>
      <rect width="960" height="540" fill="url(#glow)"/>
      <circle cx="760" cy="112" r="92" fill="${ad.accent}" opacity="0.22"/>
      <circle cx="820" cy="410" r="150" fill="#ffffff" opacity="0.08"/>
      <rect x="72" y="82" width="196" height="42" rx="21" fill="#ffffff" opacity="0.16"/>
      <text x="96" y="109" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="20" font-weight="700">${ad.slot} ad</text>
      <text x="72" y="214" fill="#ffffff" font-family="Arial, sans-serif" font-size="58" font-weight="800">${ad.name}</text>
      <text x="72" y="274" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="28" font-weight="600">${brand}</text>
      <text x="72" y="396" fill="#ffffff" font-family="Arial, sans-serif" font-size="26" font-weight="700">${ad.imageAlt}</text>
      <rect x="72" y="424" width="248" height="6" rx="3" fill="${ad.accent}"/>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function InterestAdPopup({ user, brand, ad, activeSlot, onInterested, onNotInterested, onClose }: Props) {
  const ctrPct = (user.click_through_rate * 100).toFixed(0)
  const imageSrc = createAdImage(ad, brand)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#071326] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="relative border-b border-white/10 p-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ad popup"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
          >
            x
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-xl">
              {getInterestEmoji(user.primary_interest)}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#00C2FF]">Specific timed ad</div>
              <h3 className="mt-1 text-lg font-bold text-white">{ad.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Showing a {activeSlot.toLowerCase()} {ad.genre} ad for {user.name} based on {user.city}, {user.device}, and {ctrPct}% CTR.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr]">
          <Image
            src={imageSrc}
            alt={ad.imageAlt}
            width={960}
            height={540}
            unoptimized
            className="h-full min-h-64 w-full rounded-xl border border-white/10 bg-[#040B1A] object-contain"
          />

          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  {ad.slot}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  {ad.genre}
                </span>
              </div>
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ad name</div>
              <div className="mt-1 text-xl font-black text-white">{ad.name}</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{ad.copy}</p>
              <div className="mt-4 rounded-lg border border-white/10 bg-[#040B1A]/70 p-3 text-xs leading-relaxed text-slate-400">
                If marked not interested, this exact ad will be skipped next time. If marked interested, the next popup stays in the {ad.genre} genre with a fresh ad.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onNotInterested}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-[#FF3B5C]/40 hover:text-white"
          >
            Not interested
          </button>
          <button
            type="button"
            onClick={onInterested}
            className="rounded-lg border border-[#00E5A0]/50 bg-[#00E5A0]/15 px-4 py-2 text-xs font-bold text-[#00E5A0] transition-colors hover:bg-[#00E5A0]/25"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  )
}
