export interface User {
  user_id: string
  name: string
  age: number
  gender: string
  city: string
  device: string
  primary_interest: string
  browsing_history: string[]
  sessions_per_week: number
  avg_time_spent_mins: number
  past_purchases: number
  click_through_rate: number
  income_level: 'Low' | 'Middle' | 'High'
  last_strategy_used: string
  last_strategy_success: boolean
}

export type AgentStatus = 'idle' | 'running' | 'done' | 'fail' | 'fixing' | 'passed' | 'evolved'

export interface DoneData {
  final_strategy: string
  final_copy: string
  channel: string
  predicted_ctr: number
  confidence: number
  persona: string
}

export interface EvolveData {
  iteration: number
  evolved_strategy_name: string
  ad_copy: string
  channel: string
  improvement_rationale: string
  predicted_ctr_improvement: string
  predicted_ctr: number
  confidence_score: number
}

export interface CTRDataPoint {
  label: string
  ctr: number
  predicted?: number
}

export interface PipelineState {
  status: 'idle' | 'behavior' | 'persona' | 'strategy' | 'copy' | 'compliance' | 'done'
  isRunning: boolean
  done?: DoneData
  behavior?: {
    engagement_level: string
    behavior_tag: string
    top_interests: string[]
    purchase_frequency: string
    session_intensity: string
  }
  persona?: {
    persona_type: string
    buying_motivation: string
    preferred_tone: string
    risk_profile: string
    best_channel: string
  }
  strategy?: {
    strategy_id: string
    strategy_name: string
    reasoning: string
    confidence_score: number
    channel: string
    tool_called: string
    ctr_history?: any
  }
  copy?: {
    draft_copy: string
    channel: string
    strategy: string
    tone_used: string
  }
  compliance?: {
    passed: boolean
    violations: string[]
    total_attempts: number
    corrected_copy?: string
  }
}
