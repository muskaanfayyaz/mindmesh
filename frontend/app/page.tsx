'use client'
import { useState } from 'react'
import UserPanel from './components/UserPanel'
import AgentFeed from './components/AgentFeed'
import CTRChart from './components/CTRChart'
import ComplianceLog, { LogEntry } from './components/ComplianceLog'
import { User, PipelineState, EvolveData, CTRDataPoint } from './lib/types'

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pipeline, setPipeline] = useState<PipelineState>({
    status: 'idle',
    isRunning: false
  })
  const [evolveData, setEvolveData] = useState<EvolveData[]>([])
  const [isEvolving, setIsEvolving] = useState(false)
  const [complianceLogs, setComplianceLogs] = useState<LogEntry[]>([])
  const [ctrHistoryData, setCtrHistoryData] = useState<CTRDataPoint[]>([])
  const [baselineCTR, setBaselineCTR] = useState<number>(0)
  const [selectedBrand, setSelectedBrand] = useState('ImagineArt')
  
  // Quick stats counters
  const [runsCount, setRunsCount] = useState(1284)
  const [avgCTR, setAvgCTR] = useState(9.2)
  const [fixedCount, setFixedCount] = useState(441)

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user)
    setPipeline({
      status: 'idle',
      isRunning: false
    })
    setEvolveData([])
    setIsEvolving(false)
    setBaselineCTR(user.click_through_rate)
    
    // Fetch metrics history
    try {
      const res = await fetch(`http://localhost:8000/api/metrics/${user.user_id}`)
      if (res.ok) {
        const metrics = await res.json()
        const history: CTRDataPoint[] = [
          { label: 'Baseline', ctr: user.click_through_rate }
        ]
        
        // Add previous runs to history
        if (metrics.strategy_history && metrics.strategy_history.length > 0) {
          metrics.strategy_history.forEach((h: any, idx: number) => {
            history.push({
              label: `Run ${idx + 1}`,
              ctr: h.predicted_ctr || h.ctr || user.click_through_rate,
            })
          })
        } else if (user.last_strategy_used) {
          history.push({
            label: 'Last Run',
            ctr: user.click_through_rate
          })
        }
        
        setCtrHistoryData(history)
      } else {
        setCtrHistoryData([{ label: 'Baseline', ctr: user.click_through_rate }])
      }
    } catch (e) {
      console.error(e)
      setCtrHistoryData([{ label: 'Baseline', ctr: user.click_through_rate }])
    }
  }

  const handleRunPipeline = (brandName?: string) => {
    if (!selectedUser) return
    const activeBrand = brandName || selectedBrand
    
    // Reset pipeline state
    setPipeline({
      status: 'behavior',
      isRunning: true
    })
    setEvolveData([])
    setIsEvolving(false)
    
    const timestamp = new Date().toLocaleTimeString()
    setComplianceLogs(prev => [
      ...prev,
      {
        timestamp,
        status: 'pass',
        message: `Pipeline triggered for ${selectedUser.name} [Brand: ${activeBrand}]`,
        user: selectedUser.name
      }
    ])

    const eventSource = new EventSource(`http://localhost:8000/api/stream/${selectedUser.user_id}?brand=${encodeURIComponent(activeBrand)}`)
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const step = parsed.step
        const data = parsed.data
        
        if (step === 'error') {
          console.error(data.message)
          setPipeline(prev => ({ ...prev, isRunning: false }))
          eventSource.close()
          return
        }

        setPipeline(prev => {
          const nextState = { ...prev }
          nextState.status = step
          
          if (step === 'behavior') {
            nextState.behavior = data
          } else if (step === 'persona') {
            nextState.persona = data
          } else if (step === 'strategy') {
            nextState.strategy = data
          } else if (step === 'copy') {
            nextState.copy = data
          } else if (step === 'compliance_attempt') {
            nextState.compliance = {
              passed: false,
              violations: data.violations,
              total_attempts: data.attempt,
              corrected_copy: data.corrected_copy
            }
            setComplianceLogs(logs => [
              ...logs,
              {
                timestamp: new Date().toLocaleTimeString(),
                status: 'fail',
                message: `Compliance violation: ${data.violations[0]}`,
                user: selectedUser.name
              }
            ])
            setFixedCount(c => c + 1)
          } else if (step === 'compliance') {
            nextState.compliance = {
              passed: data.passed,
              violations: data.violations,
              total_attempts: data.total_attempts,
              corrected_copy: data.final_copy
            }
            setComplianceLogs(logs => [
              ...logs,
              {
                timestamp: new Date().toLocaleTimeString(),
                status: data.passed ? 'pass' : 'fail',
                message: data.passed 
                  ? `Compliance approved`
                  : `Compliance rejected`,
                user: selectedUser.name
              }
            ])
          } else if (step === 'done') {
            nextState.done = data
            nextState.isRunning = false
            eventSource.close()
            
            // Increment runs
            setRunsCount(c => c + 1)
            
            // Add to chart history
            setCtrHistoryData(history => {
              const updated = [...history]
              updated.push({
                label: `Run ${updated.length}`,
                ctr: data.predicted_ctr
              })
              return updated
            })
            
            setComplianceLogs(logs => [
              ...logs,
              {
                timestamp: new Date().toLocaleTimeString(),
                status: 'pass',
                message: `Optimal copy ready: ${data.final_strategy}`,
                user: selectedUser.name
              }
            ])
          }
          
          return nextState
        })
      } catch (err) {
        console.error("Error parsing SSE data", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err)
      setPipeline(prev => ({ ...prev, isRunning: false }))
      eventSource.close()
    }
  }

  const handleEvolve = () => {
    if (!selectedUser || !pipeline.done) return
    
    setIsEvolving(true)
    setEvolveData([])
    
    const timestamp = new Date().toLocaleTimeString()
    setComplianceLogs(prev => [
      ...prev,
      {
        timestamp,
        status: 'pass',
        message: `Evolution loop started (5 iterations)`,
        user: selectedUser.name
      }
    ])

    const eventSource = new EventSource(`http://localhost:8000/api/evolve/${selectedUser.user_id}`)
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const step = parsed.step
        const data = parsed.data
        
        if (step === 'error') {
          console.error(data.message)
          setIsEvolving(false)
          eventSource.close()
          return
        }

        if (step === 'evolve') {
          setEvolveData(prev => [...prev, data])
          
          setCtrHistoryData(history => {
            const updated = [...history]
            updated.push({
              label: `Evol ${data.iteration}`,
              ctr: data.predicted_ctr,
              predicted: data.predicted_ctr
            })
            return updated
          })
          
          setComplianceLogs(logs => [
            ...logs,
            {
              timestamp: new Date().toLocaleTimeString(),
              status: 'fix',
              message: `Iteration ${data.iteration}: Strategy evolved to ${data.evolved_strategy_name}`,
              user: selectedUser.name
            }
          ])
        } else if (step === 'evolve_done') {
          setIsEvolving(false)
          eventSource.close()
          
          setAvgCTR(c => parseFloat(( (c * runsCount + data.best_ctr * 100) / (runsCount + 1) ).toFixed(2)))
          
          setComplianceLogs(logs => [
            ...logs,
            {
              timestamp: new Date().toLocaleTimeString(),
              status: 'pass',
              message: `Evolution completed. Best CTR: ${(data.best_ctr*100).toFixed(1)}% (${data.best_strategy})`,
              user: selectedUser.name
            }
          ])
        }
      } catch (err) {
        console.error("Error parsing Evolution SSE", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error("Evolution SSE Error:", err)
      setIsEvolving(false)
      eventSource.close()
    }
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    if (selectedUser) {
      handleRunPipeline(brand)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#040B1A] text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-[56px] bg-[#040B1A] border-b border-white/10 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#00C2FF]">⚙️</span>
          <div className="flex items-baseline">
            <span className="text-white font-black tracking-tighter text-lg">MIND</span>
            <span className="text-[#00C2FF] font-black tracking-tighter text-lg">MESH</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
            <span className="text-[10px] font-bold text-[#10B981] tracking-wider">LIVE ORCHESTRATION</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[10px] font-bold text-[#00C2FF] tracking-wider">
            5 AGENTS ACTIVE
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="bg-navy border border-white/10 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-[#00C2FF] transition-colors"
          >
            <option value="ImagineArt">ImagineArt</option>
            <option value="Stitch Apparel">Stitch Apparel</option>
            <option value="Kolachi FinTech">Kolachi FinTech</option>
          </select>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT PANEL: USERS */}
        <UserPanel selectedUser={selectedUser} onSelectUser={handleSelectUser} />

        {/* MIDDLE PANEL: PIPELINE */}
        <AgentFeed
          user={selectedUser}
          pipeline={pipeline}
          evolveData={evolveData}
          isEvolving={isEvolving}
          onRun={handleRunPipeline}
          onEvolve={handleEvolve}
        />

        {/* RIGHT PANEL: ANALYTICS & LOGS */}
        <div className="w-80 flex-shrink-0 flex flex-col h-full border-l border-white/5 bg-[#040B1A] p-4 gap-4 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Performance Matrix</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] text-slate-500 uppercase">Runs</div>
                <div className="text-sm font-bold text-white mt-1">{runsCount}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] text-slate-500 uppercase">Avg CTR</div>
                <div className="text-sm font-bold text-[#00E5A0] mt-1">{avgCTR}%</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] text-slate-500 uppercase">Fixed</div>
                <div className="text-sm font-bold text-[#FFB800] mt-1">{fixedCount}</div>
              </div>
            </div>
          </div>

          {/* CTR Chart */}
          <CTRChart data={ctrHistoryData} baseline={baselineCTR} />

          {/* Compliance Log */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ComplianceLog entries={complianceLogs} />
          </div>
        </div>
      </div>
    </div>
  )
}
