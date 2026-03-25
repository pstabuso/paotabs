import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Brain, Moon, Utensils, Zap, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Heart, RotateCcw } from 'lucide-react'

const SLEEP_OPTIONS = [
  { value: 'well', label: 'Well', icon: '😴', desc: 'Restful 7-9 hours' },
  { value: 'restless', label: 'Restlessly', icon: '😐', desc: 'Woke up often' },
  { value: 'poor', label: 'Poorly', icon: '😫', desc: 'Could barely sleep' },
]
const APPETITE_OPTIONS = [
  { value: 'normal', label: 'Normal', icon: '🍽️', desc: 'Eating as usual' },
  { value: 'increased', label: 'Increased', icon: '🍔', desc: 'Eating more' },
  { value: 'decreased', label: 'Decreased', icon: '🥗', desc: 'Less appetite' },
]
const OVERWHELMED_OPTIONS = [
  { value: 'not_at_all', label: 'Not at all', desc: 'Feeling in control' },
  { value: 'sometimes', label: 'Sometimes', desc: 'Occasional pressure' },
  { value: 'often', label: 'Often', desc: 'Constant pressure' },
]
const ENERGY_OPTIONS = [
  { value: 'high', label: 'High', desc: 'Energized', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 ring-emerald-500/10' },
  { value: 'medium', label: 'Medium', desc: 'Moderate', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25 ring-amber-500/10' },
  { value: 'low', label: 'Low', desc: 'Drained', color: 'bg-red-500/15 text-red-400 border-red-500/25 ring-red-500/10' },
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
  { title: 'Tell us how you feel', subtitle: 'Your thoughts and feelings matter', icon: Heart },
  { title: 'Physical wellness', subtitle: 'Sleep and appetite patterns', icon: Moon },
  { title: 'Mental state', subtitle: 'Overwhelm and energy levels', icon: Zap },
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
      <div className="max-w-2xl mx-auto animate-enter space-y-6">
        <div className="glass rounded-3xl p-8 text-center glow-border relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 30%, ${levelColor}40, transparent 70%)` }} />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-5" style={{ background: `${levelColor}15`, boxShadow: `0 0 40px ${levelColor}15` }}>
              <span className="text-4xl font-extrabold" style={{ color: levelColor }}>
                {result.stress_level}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-50">Stress Level: {result.stress_level}/10</h2>
            <p className="text-slate-400 mt-2 text-sm">
              {result.stress_level <= 3 ? 'Looking good! Low stress detected.' :
               result.stress_level <= 6 ? 'Moderate stress. Take a moment for yourself.' :
               'High stress detected. Please take care of yourself.'}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-6 h-2 rounded-full transition-all" style={{
                  backgroundColor: i < result.stress_level ? levelColor : 'rgba(255,255,255,0.05)',
                  opacity: i < result.stress_level ? 1 : 0.3,
                }} />
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 glow-border">
          <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10"><CheckCircle size={16} className="text-indigo-400" /></div>
            Personalized Advice
          </h3>
          <div className="space-y-4 stagger">
            {result.advice.split('\n\n').map((tip, i) => (
              <div key={i} className="flex gap-3 pl-1">
                <div className="w-1 rounded-full bg-gradient-to-b from-indigo-500/60 to-purple-500/20 flex-shrink-0 mt-1" />
                <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={reset} className="w-full py-3.5 rounded-xl glass hover:bg-white/[0.04] transition-all text-sm font-medium text-slate-300 flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Take Another Assessment
        </button>
      </div>
    )
  }

  const steps = [
    <div key="feelings" className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-slate-200 block mb-2.5">How are you feeling right now?</label>
        <textarea
          value={form.feelings} onChange={e => setForm({ ...form, feelings: e.target.value })}
          placeholder="Describe your current emotional state..."
          className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F19]/60 border border-slate-700/40 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none h-28 transition-all placeholder:text-slate-600"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-200 block mb-2.5">What problems are you facing?</label>
        <textarea
          value={form.problems} onChange={e => setForm({ ...form, problems: e.target.value })}
          placeholder="What's been on your mind or causing stress..."
          className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F19]/60 border border-slate-700/40 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none h-28 transition-all placeholder:text-slate-600"
        />
      </div>
    </div>,

    <div key="physical" className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Moon size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">How did you sleep?</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SLEEP_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, sleep_quality: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                form.sleep_quality === opt.value
                  ? 'bg-indigo-500/12 border-indigo-500/30 ring-1 ring-indigo-500/15 shadow-lg shadow-indigo-500/5'
                  : 'glass border-transparent hover:border-white/[0.06]'
              }`}>
              <div className="text-2xl mb-1.5">{opt.icon}</div>
              <div className={`text-sm font-medium ${form.sleep_quality === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Utensils size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">How's your appetite?</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {APPETITE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, appetite: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                form.appetite === opt.value
                  ? 'bg-indigo-500/12 border-indigo-500/30 ring-1 ring-indigo-500/15 shadow-lg shadow-indigo-500/5'
                  : 'glass border-transparent hover:border-white/[0.06]'
              }`}>
              <div className="text-2xl mb-1.5">{opt.icon}</div>
              <div className={`text-sm font-medium ${form.appetite === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,

    <div key="mental" className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Do you feel overwhelmed?</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {OVERWHELMED_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, overwhelmed: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                form.overwhelmed === opt.value
                  ? 'bg-indigo-500/12 border-indigo-500/30 ring-1 ring-indigo-500/15 shadow-lg shadow-indigo-500/5'
                  : 'glass border-transparent hover:border-white/[0.06]'
              }`}>
              <div className={`text-sm font-medium ${form.overwhelmed === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Energy level?</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ENERGY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setForm({ ...form, energy_level: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                form.energy_level === opt.value ? `${opt.color} ring-1` : 'glass border-transparent hover:border-white/[0.06]'
              }`}>
              <div className={`text-sm font-medium ${form.energy_level === opt.value ? '' : 'text-slate-300'}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,
  ]

  const canProceed = step === 0 ? true : step === 1 ? form.sleep_quality && form.appetite : form.overwhelmed && form.energy_level
  const meta = STEP_META[step]

  return (
    <div className="max-w-2xl mx-auto animate-enter space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
          <Brain size={22} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50">Stress Check</h1>
          <p className="text-slate-500 text-sm mt-0.5">Quick assessment to understand your stress level</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-800/50">
            <div className={`h-full rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="flex items-center gap-3 px-1">
        <meta.icon size={16} className="text-indigo-400" />
        <div>
          <p className="text-sm font-semibold text-slate-200">{meta.title}</p>
          <p className="text-xs text-slate-500">{meta.subtitle}</p>
        </div>
        <span className="ml-auto text-xs text-slate-600 font-medium">Step {step + 1} of 3</span>
      </div>

      <div className="glass rounded-3xl p-7 glow-border">
        {steps[step]}

        <div className="flex justify-between mt-7 pt-5 border-t border-white/[0.04]">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1.5 hover:bg-white/[0.03] transition-all">
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center gap-1.5">
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed || saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center gap-1.5">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Analyze <Brain size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
