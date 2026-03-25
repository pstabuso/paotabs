import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Brain, Moon, Utensils, Zap, AlertCircle, CheckCircle } from 'lucide-react'

const SLEEP_OPTIONS = [
  { value: 'well', label: 'Well', icon: '😴' },
  { value: 'restless', label: 'Restlessly', icon: '😐' },
  { value: 'poor', label: 'Poorly', icon: '😫' },
]
const APPETITE_OPTIONS = [
  { value: 'normal', label: 'Normal', icon: '🍽️' },
  { value: 'increased', label: 'Increased', icon: '🍔' },
  { value: 'decreased', label: 'Decreased', icon: '🥗' },
]
const OVERWHELMED_OPTIONS = [
  { value: 'not_at_all', label: 'Not at all' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'often', label: 'Often' },
]
const ENERGY_OPTIONS = [
  { value: 'high', label: 'High', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'low', label: 'Low', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
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
    if (!error) {
      setResult({ stress_level, advice })
    }
    setSaving(false)
  }

  const reset = () => {
    setStep(0)
    setForm({ feelings: '', problems: '', sleep_quality: '', appetite: '', overwhelmed: '', energy_level: '' })
    setResult(null)
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto animate-enter space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            result.stress_level <= 3 ? 'bg-emerald-500/20' : result.stress_level <= 6 ? 'bg-amber-500/20' : 'bg-red-500/20'
          }`}>
            <span className="text-3xl font-bold" style={{
              color: result.stress_level <= 3 ? '#10b981' : result.stress_level <= 6 ? '#f59e0b' : '#ef4444'
            }}>
              {result.stress_level}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Your Stress Level: {result.stress_level}/10</h2>
          <p className="text-slate-400 mt-1">
            {result.stress_level <= 3 ? 'Looking good! Low stress detected.' :
             result.stress_level <= 6 ? 'Moderate stress. Take a moment for yourself.' :
             'High stress detected. Please take care of yourself.'}
          </p>
        </div>

        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-indigo-400" /> Personalized Advice
          </h3>
          <div className="space-y-4">
            {result.advice.split('\n\n').map((tip, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                {tip}
              </p>
            ))}
          </div>
        </div>

        <button onClick={reset} className="w-full py-3 rounded-xl bg-[#131b2e] border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors text-sm font-medium">
          Take Another Assessment
        </button>
      </div>
    )
  }

  const steps = [
    // Step 0: Feelings
    <div key="feelings" className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">How are you feeling right now?</h3>
      <textarea
        value={form.feelings}
        onChange={e => setForm({ ...form, feelings: e.target.value })}
        placeholder="Describe your current emotional state..."
        className="w-full px-4 py-3 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none h-28"
      />
      <h3 className="text-lg font-semibold text-slate-200 mt-4">What problems are you facing?</h3>
      <textarea
        value={form.problems}
        onChange={e => setForm({ ...form, problems: e.target.value })}
        placeholder="What's been on your mind or causing stress..."
        className="w-full px-4 py-3 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none h-28"
      />
    </div>,

    // Step 1: Sleep + Appetite
    <div key="physical" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2"><Moon size={18} /> How did you sleep?</h3>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {SLEEP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, sleep_quality: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all ${
                form.sleep_quality === opt.value
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-[#0f1524] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2"><Utensils size={18} /> How's your appetite?</h3>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {APPETITE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, appetite: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all ${
                form.appetite === opt.value
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-[#0f1524] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2: Overwhelmed + Energy
    <div key="mental" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <AlertCircle size={18} /> Do you feel overwhelmed?
        </h3>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {OVERWHELMED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, overwhelmed: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all text-sm ${
                form.overwhelmed === opt.value
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-[#0f1524] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Zap size={18} /> Energy level?
        </h3>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {ENERGY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, energy_level: opt.value })}
              className={`p-4 rounded-xl border text-center transition-all text-sm ${
                form.energy_level === opt.value
                  ? opt.color
                  : 'bg-[#0f1524] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
  ]

  const canProceed = step === 0 ? true :
    step === 1 ? form.sleep_quality && form.appetite :
    form.overwhelmed && form.energy_level

  return (
    <div className="max-w-2xl mx-auto animate-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Brain className="text-purple-400" /> Stress Check
        </h1>
        <p className="text-slate-400 text-sm mt-1">Quick assessment to understand your stress level</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= step ? 'bg-indigo-500' : 'bg-slate-800'
          }`} />
        ))}
      </div>

      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
        {steps[step]}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Back
            </button>
          ) : <div />}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {saving ? 'Analyzing...' : 'Analyze My Stress'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
