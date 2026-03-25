import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Brain, Moon, Utensils, Zap, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Heart, RotateCcw } from 'lucide-react'

const SLEEP_OPTIONS = [
  { value: 'well', label: 'Well', icon: '😴', desc: '7-9 hours' },
  { value: 'restless', label: 'Restless', icon: '😐', desc: 'Woke often' },
  { value: 'poor', label: 'Poorly', icon: '😫', desc: 'Barely slept' },
]
const APPETITE_OPTIONS = [
  { value: 'normal', label: 'Normal', icon: '🍽️', desc: 'As usual' },
  { value: 'increased', label: 'More', icon: '🍔', desc: 'Eating more' },
  { value: 'decreased', label: 'Less', icon: '🥗', desc: 'Less appetite' },
]
const OVERWHELMED_OPTIONS = [
  { value: 'not_at_all', label: 'Not at all', desc: 'In control' },
  { value: 'sometimes', label: 'Sometimes', desc: 'Some pressure' },
  { value: 'often', label: 'Often', desc: 'Constant' },
]
const ENERGY_OPTIONS = [
  { value: 'high', label: 'High', desc: 'Energized', color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' },
  { value: 'medium', label: 'Medium', desc: 'Moderate', color: 'bg-amber-600/10 text-amber-400 border-amber-500/20' },
  { value: 'low', label: 'Low', desc: 'Drained', color: 'bg-red-600/10 text-red-400 border-red-500/20' },
]

function calculateStress(form) {
  let score = 0
  if (form.sleep_quality === 'poor') score += 3
  else if (form.sleep_quality === 'restless') score += 2
  else score += 0.5
  if (form.appetite === 'decreased') score += 2
  else if (form.appetite === 'increased') score += 1.5
  if (form.overwhelmed === 'often') score += 3
  else if (form.overwhelmed === 'sometimes') score += 1.5
  if (form.energy_level === 'low') score += 2
  else if (form.energy_level === 'medium') score += 1
  return Math.min(10, Math.max(1, Math.round(score)))
}

function generateAdvice(level, form) {
  const tips = []
  if (form.sleep_quality !== 'well') tips.push('Try establishing a consistent sleep schedule. Aim for 7-9 hours and avoid screens 1 hour before bed.')
  if (form.appetite !== 'normal') tips.push('Pay attention to your eating patterns. Regular, balanced meals help stabilize mood and energy levels.')
  if (form.overwhelmed !== 'not_at_all') tips.push('Break large tasks into smaller steps. Prioritize what matters most and don\'t hesitate to delegate or say no.')
  if (form.energy_level !== 'high') tips.push('Incorporate short walks or light exercise into your day. Even 15 minutes can boost energy and reduce stress.')
  if (level >= 7) tips.push('Your stress level is high. Consider talking to a counselor or trusted friend. Deep breathing exercises (4-7-8 technique) can provide immediate relief.')
  if (level <= 3) tips.push('You\'re managing well! Keep up your current routine and maintain those healthy habits.')
  if (form.feelings) tips.push(`Acknowledge your feelings — "${form.feelings.slice(0, 60)}..." is valid. Journaling can help process these emotions.`)
  return tips.join('\n\n')
}

const STEP_META = [
  { title: 'How you feel', subtitle: 'Thoughts and feelings', icon: Heart },
  { title: 'Physical wellness', subtitle: 'Sleep & appetite', icon: Moon },
  { title: 'Mental state', subtitle: 'Overwhelm & energy', icon: Zap },
]

export default function StressAssessment() {
  const { addAssessment } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    feelings: '', problems: '', sleep_quality: '', appetite: '',
    overwhelmed: '', energy_level: ''
  })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    const stress_level = calculateStress(form)
    const advice = generateAdvice(stress_level, form)
    const { error } = await addAssessment({ ...form, stress_level, advice })
    if (!error) setResult({ stress_level, advice })
    setSaving(false)
  }

  const reset = () => {
    setStep(0)
    setForm({ feelings: '', problems: '', sleep_quality: '', appetite: '', overwhelmed: '', energy_level: '' })
    setResult(null)
  }

  if (result) {
    const levelColor = result.stress_level <= 3 ? '#10b981' : result.stress_level <= 6 ? '#f59e0b' : '#ef4444'
    return (
      <div className="max-w-lg mx-auto animate-enter space-y-4">
        <div className="bg-[#131b2e] rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4" style={{ background: `${levelColor}15` }}>
            <span className="text-3xl sm:text-4xl font-bold" style={{ color: levelColor }}>
              {result.stress_level}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Stress Level: {result.stress_level}/10</h2>
          <p className="text-slate-400 mt-1.5 text-xs">
            {result.stress_level <= 3 ? 'Looking good! Low stress.' :
             result.stress_level <= 6 ? 'Moderate stress. Take a moment.' :
             'High stress. Please take care.'}
          </p>
          <div className="flex justify-center gap-0.5 mt-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-4 sm:w-5 h-1.5 rounded-full transition-all" style={{
                backgroundColor: i < result.stress_level ? levelColor : 'rgba(255,255,255,0.05)',
                opacity: i < result.stress_level ? 1 : 0.3,
              }} />
            ))}
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold text-slate-200 mb-4 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-600/10"><CheckCircle size={13} className="text-blue-400" /></div>
            Personalized Advice
          </h3>
          <div className="space-y-3 stagger">
            {result.advice.split('\n\n').map((tip, i) => (
              <div key={i} className="flex gap-2.5 pl-0.5">
                <div className="w-0.5 rounded-full bg-blue-500/40 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="w-full py-2.5 rounded-lg bg-[#131b2e] border border-slate-800 hover:bg-slate-800/40 transition-all text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
          <RotateCcw size={12} /> Take Another
        </button>
      </div>
    )
  }

  const steps = [
    <div key="feelings" className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-200 block mb-2">How are you feeling right now?</label>
        <textarea
          value={form.feelings} onChange={e => setForm({ ...form, feelings: e.target.value })}
          placeholder="Describe your current emotional state..."
          className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none h-20 sm:h-24 transition-all placeholder:text-slate-600"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-200 block mb-2">What problems are you facing?</label>
        <textarea
          value={form.problems} onChange={e => setForm({ ...form, problems: e.target.value })}
          placeholder="What's been causing stress..."
          className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none h-20 sm:h-24 transition-all placeholder:text-slate-600"
        />
      </div>
    </div>,

    <div key="physical" className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Moon size={13} className="text-blue-400" />
          <h3 className="text-xs font-bold text-slate-200">How did you sleep?</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SLEEP_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, sleep_quality: opt.value })}
              className={`p-2.5 sm:p-3 rounded-lg border text-center transition-all ${
                form.sleep_quality === opt.value
                  ? 'bg-blue-600/10 border-blue-500/30'
                  : 'bg-[#1e293b] border-slate-700/50 hover:border-blue-500/30'
              }`}>
              <div className="text-lg sm:text-xl mb-0.5">{opt.icon}</div>
              <div className={`text-[11px] font-bold ${form.sleep_quality === opt.value ? 'text-blue-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Utensils size={13} className="text-blue-400" />
          <h3 className="text-xs font-bold text-slate-200">Appetite?</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {APPETITE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, appetite: opt.value })}
              className={`p-2.5 sm:p-3 rounded-lg border text-center transition-all ${
                form.appetite === opt.value
                  ? 'bg-blue-600/10 border-blue-500/30'
                  : 'bg-[#1e293b] border-slate-700/50 hover:border-blue-500/30'
              }`}>
              <div className="text-lg sm:text-xl mb-0.5">{opt.icon}</div>
              <div className={`text-[11px] font-bold ${form.appetite === opt.value ? 'text-blue-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,

    <div key="mental" className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <AlertCircle size={13} className="text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200">Feel overwhelmed?</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {OVERWHELMED_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, overwhelmed: opt.value })}
              className={`p-2.5 sm:p-3 rounded-lg border text-center transition-all ${
                form.overwhelmed === opt.value
                  ? 'bg-blue-600/10 border-blue-500/30'
                  : 'bg-[#1e293b] border-slate-700/50 hover:border-blue-500/30'
              }`}>
              <div className={`text-[11px] font-bold ${form.overwhelmed === opt.value ? 'text-blue-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Zap size={13} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200">Energy level?</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, energy_level: opt.value })}
              className={`p-2.5 sm:p-3 rounded-lg border text-center transition-all ${
                form.energy_level === opt.value ? opt.color : 'bg-[#1e293b] border-slate-700/50 hover:border-blue-500/30'
              }`}>
              <div className={`text-[11px] font-bold ${form.energy_level === opt.value ? '' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,
  ]

  const canProceed = step === 0 ? true : step === 1 ? form.sleep_quality && form.appetite : form.overwhelmed && form.energy_level
  const meta = STEP_META[step]

  return (
    <div className="max-w-lg mx-auto animate-enter space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-purple-600/10">
          <Brain size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Stress Check</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">Quick wellness assessment</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-slate-800/50">
            <div className={`h-full rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600 w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="flex items-center gap-2 px-0.5">
        <meta.icon size={13} className="text-blue-400" />
        <div>
          <p className="text-xs font-bold text-slate-200">{meta.title}</p>
          <p className="text-[10px] text-slate-500">{meta.subtitle}</p>
        </div>
        <span className="ml-auto text-[9px] text-slate-600 font-bold uppercase tracking-wider">{step + 1}/3</span>
      </div>

      <div className="bg-[#131b2e] rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5">
        {steps[step]}

        <div className="flex justify-between mt-5 pt-4 border-t border-slate-800/50">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:bg-slate-800/40 transition-all font-medium">
              <ArrowLeft size={12} /> Back
            </button>
          ) : <div />}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/20 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center gap-1">
              Next <ArrowRight size={12} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed || saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/20 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center gap-1">
              {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Analyze <Brain size={12} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
