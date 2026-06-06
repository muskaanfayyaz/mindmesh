import { User } from './types'

export type AdSlot = 'Morning' | 'Lunch' | 'Evening' | 'Night'

export interface InterestAd {
  id: string
  genre: string
  slot: AdSlot
  name: string
  copy: string
  imageAlt: string
  accent: string
}

export interface AdDecisionState {
  blockedAdIds: Record<string, string[]>
  nextIndex: Record<string, number>
  preferences: Record<string, 'interested' | 'not_interested'>
}

export interface SelectedInterestAd {
  ad: InterestAd
  preferenceKey: string
  slot: AdSlot
}

const DEFAULT_STATE: AdDecisionState = {
  blockedAdIds: {},
  nextIndex: {},
  preferences: {}
}

const AD_CATALOG: Record<string, InterestAd[]> = {
  food: [
    { id: 'food-breakfast-cafe', genre: 'food', slot: 'Morning', name: 'Cafe Breakfast Builder', copy: 'Start the day with cafe picks, recipe visuals, and quick delivery prompts.', imageAlt: 'Breakfast cafe table', accent: '#FFB800' },
    { id: 'food-lunch-combo', genre: 'food', slot: 'Lunch', name: 'Lunch Combo Drop', copy: 'Midday meal deals matched to restaurants, recipes, and delivery browsing.', imageAlt: 'Lunch combo tray', accent: '#00E5A0' },
    { id: 'food-evening-family', genre: 'food', slot: 'Evening', name: 'Family Dinner Picks', copy: 'Family-friendly cafe and dinner ideas with warm, local copy.', imageAlt: 'Family dinner setting', accent: '#00C2FF' },
    { id: 'food-night-snack', genre: 'food', slot: 'Night', name: 'Late Snack Reminder', copy: 'Low-friction snack and dessert prompts for night browsing sessions.', imageAlt: 'Late night snacks', accent: '#9D5FF7' }
  ],
  gaming: [
    { id: 'gaming-morning-daily', genre: 'gaming', slot: 'Morning', name: 'Daily Quest Boost', copy: 'Morning login rewards and short mobile gaming prompts.', imageAlt: 'Gaming daily quest screen', accent: '#00C2FF' },
    { id: 'gaming-lunch-mobile', genre: 'gaming', slot: 'Lunch', name: 'Lunch Break Match', copy: 'Quick match invites for mobile games and esports viewers.', imageAlt: 'Mobile game session', accent: '#00E5A0' },
    { id: 'gaming-evening-arena', genre: 'gaming', slot: 'Evening', name: 'Arena Night Pass', copy: 'Evening tournament and community challenge campaigns.', imageAlt: 'Esports arena lights', accent: '#9D5FF7' },
    { id: 'gaming-night-setup', genre: 'gaming', slot: 'Night', name: 'Pro Setup Upgrade', copy: 'PC build, console, and accessory offers for late comparison browsing.', imageAlt: 'Gaming setup desk', accent: '#FF3B5C' }
  ],
  fashion: [
    { id: 'fashion-morning-fit', genre: 'fashion', slot: 'Morning', name: 'Morning Fit Edit', copy: 'Fresh outfit ideas for work, college, and city routines.', imageAlt: 'Morning outfit rack', accent: '#9D5FF7' },
    { id: 'fashion-lunch-drop', genre: 'fashion', slot: 'Lunch', name: 'Midday Style Drop', copy: 'Short, trend-led fashion prompts for active lunch browsing.', imageAlt: 'Fashion collection display', accent: '#FFB800' },
    { id: 'fashion-evening-event', genre: 'fashion', slot: 'Evening', name: 'Evening Event Looks', copy: 'Modest styling ideas and seasonal outfit recommendations.', imageAlt: 'Evening clothing display', accent: '#00C2FF' },
    { id: 'fashion-night-sale', genre: 'fashion', slot: 'Night', name: 'Night Cart Rescue', copy: 'Gentle sale reminders for saved fashion searches and collections.', imageAlt: 'Online fashion cart', accent: '#00E5A0' }
  ],
  education: [
    { id: 'education-morning-skill', genre: 'education', slot: 'Morning', name: 'Morning Skill Sprint', copy: 'Short course and tutorial recommendations to begin the day.', imageAlt: 'Online course dashboard', accent: '#00C2FF' },
    { id: 'education-lunch-lesson', genre: 'education', slot: 'Lunch', name: 'Lunch Lesson Pack', copy: 'Bite-sized learning content for users browsing tutorials.', imageAlt: 'Study notes and laptop', accent: '#00E5A0' },
    { id: 'education-evening-cert', genre: 'education', slot: 'Evening', name: 'Certification Path', copy: 'Career-ready course prompts with clear next steps.', imageAlt: 'Certificate and workspace', accent: '#9D5FF7' },
    { id: 'education-night-revision', genre: 'education', slot: 'Night', name: 'Revision Reminder', copy: 'Quiet study nudges for learners returning after hours.', imageAlt: 'Night study desk', accent: '#FFB800' }
  ],
  sports: [
    { id: 'sports-morning-training', genre: 'sports', slot: 'Morning', name: 'Morning Training Plan', copy: 'Fitness, running, and training prompts for active users.', imageAlt: 'Morning sports training', accent: '#00E5A0' },
    { id: 'sports-lunch-gear', genre: 'sports', slot: 'Lunch', name: 'Gear Finder', copy: 'Sports gear offers timed for quick midday browsing.', imageAlt: 'Sports gear lineup', accent: '#00C2FF' },
    { id: 'sports-evening-match', genre: 'sports', slot: 'Evening', name: 'Match Night Promo', copy: 'Team-inspired campaign ideas around evening match moments.', imageAlt: 'Stadium match lights', accent: '#FFB800' },
    { id: 'sports-night-recap', genre: 'sports', slot: 'Night', name: 'Post Match Recap', copy: 'Highlight and fan engagement prompts after the game.', imageAlt: 'Sports recap screen', accent: '#9D5FF7' }
  ],
  travel: [
    { id: 'travel-morning-city', genre: 'travel', slot: 'Morning', name: 'City Break Planner', copy: 'Morning itinerary prompts for destination discovery.', imageAlt: 'City travel plan', accent: '#00C2FF' },
    { id: 'travel-lunch-deal', genre: 'travel', slot: 'Lunch', name: 'Lunch Deal Finder', copy: 'Fast travel deal prompts for midday search behavior.', imageAlt: 'Travel booking screen', accent: '#00E5A0' },
    { id: 'travel-evening-route', genre: 'travel', slot: 'Evening', name: 'Evening Route Ideas', copy: 'Helpful route and stay recommendations for trip planning.', imageAlt: 'Route map and suitcase', accent: '#FFB800' },
    { id: 'travel-night-dream', genre: 'travel', slot: 'Night', name: 'Dream Trip Save', copy: 'Soft reminders to save trips and compare packages later.', imageAlt: 'Night travel mood board', accent: '#9D5FF7' }
  ],
  tech: [
    { id: 'tech-morning-productivity', genre: 'tech', slot: 'Morning', name: 'Productivity Stack', copy: 'AI tools, workflow apps, and device tips for morning planning.', imageAlt: 'Productivity app dashboard', accent: '#00C2FF' },
    { id: 'tech-lunch-launch', genre: 'tech', slot: 'Lunch', name: 'Launch Watch', copy: 'Gadget launch alerts for users comparing specs.', imageAlt: 'New tech product display', accent: '#FFB800' },
    { id: 'tech-evening-upgrade', genre: 'tech', slot: 'Evening', name: 'Device Upgrade Match', copy: 'Evening laptop, phone, and accessory recommendations.', imageAlt: 'Device upgrade desk', accent: '#00E5A0' },
    { id: 'tech-night-deep-dive', genre: 'tech', slot: 'Night', name: 'Spec Deep Dive', copy: 'Detailed tech prompts for late research and review browsing.', imageAlt: 'Tech spec comparison', accent: '#9D5FF7' }
  ],
  business: [
    { id: 'business-morning-brief', genre: 'business', slot: 'Morning', name: 'Morning Growth Brief', copy: 'Professional growth and finance prompts to start the day.', imageAlt: 'Business morning dashboard', accent: '#00E5A0' },
    { id: 'business-lunch-tools', genre: 'business', slot: 'Lunch', name: 'Founder Tool Kit', copy: 'Midday productivity and service offers for busy operators.', imageAlt: 'Business tools screen', accent: '#00C2FF' },
    { id: 'business-evening-report', genre: 'business', slot: 'Evening', name: 'Evening Report Pack', copy: 'Decision-friendly reports and planning prompts.', imageAlt: 'Business report chart', accent: '#FFB800' },
    { id: 'business-night-plan', genre: 'business', slot: 'Night', name: 'Next Day Planner', copy: 'Quiet planning reminders for business-focused night sessions.', imageAlt: 'Planning notebook', accent: '#9D5FF7' }
  ],
  blogging: [
    { id: 'blogging-morning-ideas', genre: 'blogging', slot: 'Morning', name: 'Morning Idea Board', copy: 'Creator prompts and content ideas to start publishing.', imageAlt: 'Creator idea board', accent: '#FFB800' },
    { id: 'blogging-lunch-template', genre: 'blogging', slot: 'Lunch', name: 'Template Drop', copy: 'Fast templates for SEO, captions, and short-form content.', imageAlt: 'Blog template screen', accent: '#00C2FF' },
    { id: 'blogging-evening-audience', genre: 'blogging', slot: 'Evening', name: 'Audience Growth Kit', copy: 'Evening campaign ideas for growing followers.', imageAlt: 'Audience analytics dashboard', accent: '#00E5A0' },
    { id: 'blogging-night-edit', genre: 'blogging', slot: 'Night', name: 'Night Edit Studio', copy: 'Late-session editing, scheduling, and publishing reminders.', imageAlt: 'Editing studio screen', accent: '#9D5FF7' }
  ],
  crypto: [
    { id: 'crypto-morning-education', genre: 'crypto', slot: 'Morning', name: 'Market Basics Brief', copy: 'Careful, compliant learning prompts for crypto-curious users.', imageAlt: 'Crypto education dashboard', accent: '#00E5A0' },
    { id: 'crypto-lunch-security', genre: 'crypto', slot: 'Lunch', name: 'Wallet Safety Check', copy: 'Security-first reminders with clear terms and no risky claims.', imageAlt: 'Wallet security screen', accent: '#00C2FF' },
    { id: 'crypto-evening-portfolio', genre: 'crypto', slot: 'Evening', name: 'Portfolio Learning Path', copy: 'Risk-aware portfolio education and blockchain content.', imageAlt: 'Portfolio learning chart', accent: '#FFB800' },
    { id: 'crypto-night-recap', genre: 'crypto', slot: 'Night', name: 'Night Market Recap', copy: 'Calm market recap prompts with transparent disclaimers.', imageAlt: 'Night market chart', accent: '#9D5FF7' }
  ],
  health: [
    { id: 'health-morning-habit', genre: 'health', slot: 'Morning', name: 'Morning Habit Coach', copy: 'Wellness reminders and routine prompts with gentle language.', imageAlt: 'Morning wellness routine', accent: '#00E5A0' },
    { id: 'health-lunch-nutrition', genre: 'health', slot: 'Lunch', name: 'Nutrition Check In', copy: 'Responsible meal and wellness prompts for midday behavior.', imageAlt: 'Healthy lunch screen', accent: '#FFB800' },
    { id: 'health-evening-fitness', genre: 'health', slot: 'Evening', name: 'Evening Fitness Nudge', copy: 'Workout and recovery prompts without exaggerated claims.', imageAlt: 'Evening fitness app', accent: '#00C2FF' },
    { id: 'health-night-reset', genre: 'health', slot: 'Night', name: 'Night Reset Routine', copy: 'Sleep and calm routine prompts for late sessions.', imageAlt: 'Night wellness screen', accent: '#9D5FF7' }
  ]
}

export function getAdPreferenceKey(user: User, brand: string) {
  return `${user.user_id}:${brand}:${user.primary_interest.toLowerCase()}`
}

export function getCurrentAdSlot(date = new Date()): AdSlot {
  const hour = date.getHours()
  if (hour >= 5 && hour < 11) return 'Morning'
  if (hour >= 11 && hour < 16) return 'Lunch'
  if (hour >= 16 && hour < 21) return 'Evening'
  return 'Night'
}

export function getInitialAdDecisionState(): AdDecisionState {
  return { ...DEFAULT_STATE }
}

export function normalizeAdDecisionState(value: unknown): AdDecisionState {
  if (!value || typeof value !== 'object') return getInitialAdDecisionState()
  const state = value as Partial<AdDecisionState>
  return {
    blockedAdIds: state.blockedAdIds || {},
    nextIndex: state.nextIndex || {},
    preferences: state.preferences || {}
  }
}

export function selectInterestAd(user: User, brand: string, state: AdDecisionState, date = new Date()): SelectedInterestAd | null {
  const genre = user.primary_interest.toLowerCase()
  const ads = AD_CATALOG[genre] || AD_CATALOG.tech
  const preferenceKey = getAdPreferenceKey(user, brand)
  const blocked = new Set(state.blockedAdIds[preferenceKey] || [])
  const available = ads.filter(ad => !blocked.has(ad.id))
  if (available.length === 0) return null

  const slot = getCurrentAdSlot(date)
  const timedAds = available.filter(ad => ad.slot === slot)
  const pool = timedAds.length > 0 ? timedAds : available
  const index = (state.nextIndex[preferenceKey] || 0) % pool.length

  return {
    ad: pool[index],
    preferenceKey,
    slot
  }
}

export function markAdInterested(state: AdDecisionState, selected: SelectedInterestAd): AdDecisionState {
  return {
    ...state,
    preferences: {
      ...state.preferences,
      [selected.preferenceKey]: 'interested'
    },
    nextIndex: {
      ...state.nextIndex,
      [selected.preferenceKey]: (state.nextIndex[selected.preferenceKey] || 0) + 1
    }
  }
}

export function markAdNotInterested(state: AdDecisionState, selected: SelectedInterestAd): AdDecisionState {
  const currentBlocked = state.blockedAdIds[selected.preferenceKey] || []
  const blockedAdIds = currentBlocked.includes(selected.ad.id)
    ? currentBlocked
    : [...currentBlocked, selected.ad.id]

  return {
    ...state,
    blockedAdIds: {
      ...state.blockedAdIds,
      [selected.preferenceKey]: blockedAdIds
    },
    preferences: {
      ...state.preferences,
      [selected.preferenceKey]: 'not_interested'
    },
    nextIndex: {
      ...state.nextIndex,
      [selected.preferenceKey]: (state.nextIndex[selected.preferenceKey] || 0) + 1
    }
  }
}
