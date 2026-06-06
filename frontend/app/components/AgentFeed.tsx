'use client'
import { User, PipelineState, AgentStatus, EvolveData } from '../lib/types'
import AgentStepCard from './AgentStepCard'
import FinalStrategyCard from './FinalStrategyCard'

interface Props {
  user: User | null
  pipeline: PipelineState
  evolveData: EvolveData[]
  isEvolving: boolean
  onRun: () => void
  onEvolve: () => void
}

const AGENTS = [
  { key: 'behavior', title: 'Behavior Analyst', icon: '🧠' },
  { key: 'persona',  title: 'Persona Builder',  icon: '🎭' },
  { key: 'strategy', title: 'Strategy Selector', icon: '🎯' },
  { key: 'copy',     title: 'Ad Copywriter',     icon: '✍️' },
  { key: 'compliance', title: 'Compliance Verifier', icon: '🛡️' },
]

function getAgentStatus(key: string, pipeline: PipelineState): AgentStatus {
  const stepOrder = ['behavior', 'persona', 'strategy', 'copy', 'compliance']
  const currentIdx = stepOrder.indexOf(pipeline.status)
  const agentIdx = stepOrder.indexOf(key)

  if (!pipeline.isRunning && pipeline.status === 'idle') return 'idle'
  if (agentIdx < currentIdx) return 'done'
  if (agentIdx === currentIdx) {
    if (!pipeline.isRunning && pipeline.status !== 'idle') return 'done'
    return 'running'
  }
  if (key === 'compliance') {
    if (pipeline.compliance?.passed === false && pipeline.isRunning) return 'fixing'
    if (pipeline.compliance?.passed === false && !pipeline.isRunning) return 'fail'
    if (pipeline.compliance?.passed === true) return 'passed'
  }
  return 'idle'
}

function getAgentData(key: string, pipeline: PipelineState): Record<string, unknown> | undefined {
  const map: Record<string, unknown> = {
    behavior: pipeline.behavior,
    persona: pipeline.persona,
    strategy: pipeline.strategy ? {
      strategy_name: pipeline.strategy.strategy_name,
      confidence_score: pipeline.strategy.confidence_score,
      channel: pipeline.strategy.channel,
      tool_called: pipeline.strategy.tool_called,
      reasoning: pipeline.strategy.reasoning?.slice(0, 80) + '...',
    } : undefined,
    copy: pipeline.copy ? {
      channel: pipeline.copy.channel,
      tone_used: pipeline.copy.tone_used,
      draft_copy: pipeline.copy.draft_copy?.slice(0, 80) + '...',
    } : undefined,
    compliance: pipeline.compliance ? {
      passed: pipeline.compliance.passed,
      attempts: pipeline.compliance.total_attempts,
      violations: pipeline.compliance.violations?.length
        ? pipeline.compliance.violations[0]?.slice(0, 60)
        : 'None',
    } : undefined,
  }
  return map[key] as Record<string, unknown> | undefined
}

export default function AgentFeed({ user, pipeline, evolveData, isEvolving, onRun, onEvolve }: Props) {
  const canRun = user && !pipeline.isRunning && !isEvolving
  const canEvolve = user && pipeline.status === 'done' && !isEvolving && !pipeline.isRunning
  const lastEvolve = evolveData[evolveData.length - 1]

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 border-r border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div>
          <h2 className="text-sm font-semibold text-white">Agent Pipeline</h2>
          {user ? (
            <div className="text-xs text-slate-400 mt-0.5">
              Running for <span style={{ color: '#00C2FF' }}>{user.name}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-600 mt-0.5">Select a user to begin</div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Run button */}
          <button
            onClick={onRun}
            disabled={!canRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: canRun ? 'rgba(0,194,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${canRun ? 'rgba(0,194,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
              color: canRun ? '#00C2FF' : '#475569',
              cursor: canRun ? 'pointer' : 'not-allowed',
            }}
          >
            {pipeline.isRunning ? (
              <><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
              Running...</>
            ) : '▶ Run Pipeline'}
          </button>

          {/* Evolve button */}
          <button
            onClick={onEvolve}
            disabled={!canEvolve}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: canEvolve
                ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,194,255,0.2))'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${canEvolve ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.06)'}`,
              color: canEvolve ? '#9D5FF7' : '#475569',
              cursor: canEvolve ? 'pointer' : 'not-allowed',
              boxShadow: canEvolve ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
              animation: canEvolve ? 'pulse-neon 2s ease-in-out infinite' : 'none',
            }}
          >
            {isEvolving ? (
              <><span className="w-3 h-3 rounded-full border border-purple-light border-t-transparent animate-spin" />
              Evolving...</>
            ) : '🔄 Evolve'}
          </button>
        </div>
      </div>

      {/* Agent cards */}
      <div className="flex-1 overflow-y-auto p-4">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">🤖</div>
            <div className="text-sm font-semibold text-slate-400">Select a user from the left panel</div>
            <div className="text-xs text-slate-600 mt-1">The 5-agent pipeline will run automatically</div>
          </div>
        ) : (
          <>
            {AGENTS.map((agent, i) => (
              <AgentStepCard
                key={agent.key}
                index={i + 1}
                title={agent.title}
                icon={agent.icon}
                status={getAgentStatus(agent.key, pipeline)}
                data={getAgentData(agent.key, pipeline)}
              />
            ))}

            {/* Final result */}
            {pipeline.done && (
              <FinalStrategyCard data={pipeline.done} isEvolved={false} />
            )}

            {/* Evolution results */}
            {evolveData.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-white">Evolution Loop</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#9D5FF7', border: '1px solid rgba(124,58,237,0.3)' }}>
                    {evolveData.length} / 5 iterations
                  </span>
                  {isEvolving && (
                    <span className="w-3 h-3 rounded-full border border-purple-light border-t-transparent animate-spin" />
                  )}
                </div>
                {evolveData.map((ev, i) => (
                  <div key={i} className="rounded-lg p-3 mb-2"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: '#9D5FF7' }}>
                        Iteration {ev.iteration}: {ev.evolved_strategy_name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: '#00E5A0' }}>
                        {ev.predicted_ctr_improvement}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ev.ad_copy}</p>
                    <div className="text-[10px] text-slate-500 mt-1.5">{ev.improvement_rationale?.slice(0, 100)}...</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
