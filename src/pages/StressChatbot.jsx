import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, RotateCcw, Brain, Sparkles } from 'lucide-react'

const QUESTIONS = [
  {
    id: 'greeting',
    text: "Hi there! I'm your AI wellness companion. I'll help you understand your stress levels through a quick conversation. How are you feeling today?",
    type: 'open',
    followUp: (answer) => {
      const lower = answer.toLowerCase()
      if (lower.includes('bad') || lower.includes('awful') || lower.includes('terrible') || lower.includes('stressed') || lower.includes('anxious') || lower.includes('overwhelmed'))
        return "I'm sorry to hear you're going through a tough time. Let's explore what's contributing to how you feel. "
      if (lower.includes('good') || lower.includes('great') || lower.includes('fine') || lower.includes('okay') || lower.includes('ok'))
        return "That's good to hear! Even when things seem okay, it's valuable to check in with yourself. "
      return "Thank you for sharing. Let's dig a little deeper to understand what's going on. "
    }
  },
  {
    id: 'stressors',
    text: "What's been the main source of stress or concern in your life recently? (e.g., school, work, relationships, health, finances)",
    type: 'open',
    followUp: (answer) => {
      const lower = answer.toLowerCase()
      if (lower.includes('school') || lower.includes('study') || lower.includes('exam') || lower.includes('class') || lower.includes('grades') || lower.includes('homework') || lower.includes('academic'))
        return "Academic pressure can be really intense. Many students experience this. "
      if (lower.includes('work') || lower.includes('job') || lower.includes('boss') || lower.includes('deadline') || lower.includes('career'))
        return "Work-related stress is one of the most common stressors. You're not alone in this. "
      if (lower.includes('relationship') || lower.includes('friend') || lower.includes('family') || lower.includes('partner') || lower.includes('lonely'))
        return "Relationships deeply impact our wellbeing. It makes sense that this is weighing on you. "
      return "I understand. That sounds like it's been weighing on you. "
    }
  },
  {
    id: 'sleep',
    text: "How has your sleep been lately?",
    type: 'choice',
    options: ['Sleeping well (7-9 hrs)', 'Restless/waking up often', 'Having trouble falling asleep', 'Barely sleeping'],
    followUp: (answer) => {
      if (answer.includes('well')) return "Great sleep hygiene! That's a strong foundation for managing stress. "
      if (answer.includes('Barely')) return "Sleep deprivation significantly amplifies stress. This is important to address. "
      return "Sleep disturbances are a common stress indicator. "
    }
  },
  {
    id: 'physical',
    text: "Have you noticed any physical symptoms? Select all that apply:",
    type: 'choice',
    options: ['Headaches or tension', 'Stomach issues', 'Muscle tightness', 'Fatigue/low energy', 'None of these'],
    followUp: (answer) => {
      if (answer.includes('None')) return "That's encouraging that stress isn't manifesting physically yet. "
      return "Your body is telling you something important. Physical symptoms are your body's way of signaling it needs attention. "
    }
  },
  {
    id: 'coping',
    text: "When you feel stressed, what do you usually do to cope?",
    type: 'choice',
    options: ['Exercise or walk', 'Talk to someone', 'Social media/screens', 'Sleep or isolate', 'Nothing specific'],
    followUp: (answer) => {
      if (answer.includes('Exercise') || answer.includes('Talk')) return "Those are healthy coping strategies! Keep it up. "
      if (answer.includes('Social media') || answer.includes('Sleep or isolate')) return "While these feel comforting in the moment, they can sometimes increase stress over time. "
      return "Developing healthy coping strategies can make a big difference. "
    }
  },
  {
    id: 'mood',
    text: "On a scale of 1-10, how would you rate your overall mood this past week? (1 = very low, 10 = excellent)",
    type: 'scale',
    followUp: (answer) => {
      const num = parseInt(answer)
      if (num >= 7) return "A strong mood score! You seem to be managing well emotionally. "
      if (num >= 4) return "A moderate mood — there's room for improvement, and that's okay. "
      return "That's a low score, and I want you to know it's okay to not be okay. "
    }
  },
  {
    id: 'support',
    text: "Do you have people you can talk to when things get tough?",
    type: 'choice',
    options: ['Yes, strong support system', 'A few people', 'Not really', 'I prefer handling things alone'],
    followUp: (answer) => {
      if (answer.includes('strong')) return "Having a support network is incredibly protective against stress. "
      if (answer.includes('Not really') || answer.includes('alone')) return "Social connection is a powerful stress buffer. Consider reaching out, even in small ways. "
      return "Even a few trusted people can make a meaningful difference. "
    }
  },
  {
    id: 'selfcare',
    text: "Last question — how often do you take time for activities you enjoy?",
    type: 'choice',
    options: ['Daily', 'A few times a week', 'Rarely', 'I can\'t remember the last time'],
    followUp: (answer) => {
      if (answer.includes('Daily') || answer.includes('few times')) return "Regular enjoyment is a great stress antidote! "
      return "Making time for joy, even briefly, is crucial for mental health. "
    }
  },
]

function analyzeResponses(responses) {
  let score = 0
  let maxScore = 0
  const insights = []
  const recommendations = []

  // Greeting sentiment
  const greeting = (responses.greeting || '').toLowerCase()
  if (greeting.includes('bad') || greeting.includes('awful') || greeting.includes('terrible') || greeting.includes('stressed') || greeting.includes('anxious')) {
    score += 3; maxScore += 3
    insights.push('You indicated feeling stressed or negative when we started our conversation.')
  } else if (greeting.includes('good') || greeting.includes('great') || greeting.includes('fine')) {
    score += 0.5; maxScore += 3
  } else {
    score += 1.5; maxScore += 3
  }

  // Stressors
  const stressors = (responses.stressors || '').toLowerCase()
  maxScore += 2
  if (stressors.length > 50) { score += 2; insights.push('You described significant stressors in your life.') }
  else if (stressors.length > 20) { score += 1 }

  // Sleep
  const sleep = responses.sleep || ''
  maxScore += 3
  if (sleep.includes('Barely')) { score += 3; insights.push('Severe sleep disruption detected — this is a major stress amplifier.'); recommendations.push('Prioritize sleep hygiene: set a fixed bedtime, avoid screens 1 hour before bed, keep your room dark and cool. Consider the 4-7-8 breathing technique before sleep.') }
  else if (sleep.includes('trouble')) { score += 2; insights.push('Difficulty falling asleep suggests an overactive mind at night.'); recommendations.push('Try a wind-down routine: journaling your thoughts 30 minutes before bed can help "offload" worries. Avoid caffeine after 2 PM.') }
  else if (sleep.includes('Restless')) { score += 1.5; recommendations.push('To improve sleep quality, try keeping a consistent wake time, even on weekends.') }
  else { score += 0.5 }

  // Physical symptoms
  const physical = responses.physical || ''
  maxScore += 3
  if (physical.includes('None')) { score += 0.5 }
  else {
    const symptoms = ['Headaches', 'Stomach', 'Muscle', 'Fatigue'].filter(s => physical.includes(s))
    score += Math.min(3, symptoms.length * 1)
    if (symptoms.length >= 2) {
      insights.push(`Multiple physical symptoms detected (${symptoms.join(', ').toLowerCase()}) — your body is showing stress signals.`)
      recommendations.push('Consider progressive muscle relaxation (PMR) — tensing and releasing each muscle group for 5-10 seconds. This reduces physical tension effectively.')
    }
    if (physical.includes('Fatigue')) recommendations.push('Combat fatigue with short 10-15 minute walks. Even brief movement boosts energy more effectively than caffeine.')
  }

  // Coping
  const coping = responses.coping || ''
  maxScore += 2
  if (coping.includes('Exercise') || coping.includes('Talk')) { score += 0.5; insights.push('You use healthy coping mechanisms — this is protective.') }
  else if (coping.includes('Social media') || coping.includes('isolate')) { score += 2; insights.push('Your current coping strategies may be contributing to stress rather than relieving it.'); recommendations.push('Try replacing 15 minutes of screen time with a short walk or stretching. Start small — even 5 minutes of mindful breathing counts.') }
  else { score += 1; recommendations.push('Develop a go-to stress relief toolkit: deep breathing, a favorite playlist, a quick walk, or calling a friend.') }

  // Mood
  const mood = parseInt(responses.mood) || 5
  maxScore += 3
  if (mood <= 3) { score += 3; insights.push('Your mood score suggests you may be going through a particularly difficult period.') }
  else if (mood <= 5) { score += 2 }
  else if (mood <= 7) { score += 1 }
  else { score += 0.5 }

  // Support system
  const support = responses.support || ''
  maxScore += 2
  if (support.includes('Not really') || support.includes('alone')) {
    score += 2
    insights.push('Limited social support increases vulnerability to stress.')
    recommendations.push('Consider joining a study group, club, or online community aligned with your interests. Even one meaningful connection can make a difference.')
  } else { score += 0.5 }

  // Self-care
  const selfcare = responses.selfcare || ''
  maxScore += 2
  if (selfcare.includes('Rarely') || selfcare.includes('remember')) {
    score += 2
    insights.push('Lack of enjoyable activities suggests burnout risk.')
    recommendations.push('Schedule at least 20 minutes daily for something you enjoy — reading, music, games, art. Treat it as non-negotiable, like eating.')
  } else { score += 0.5 }

  // Calculate percentage and convert to 1-10
  const stressLevel = Math.min(10, Math.max(1, Math.round((score / maxScore) * 10)))

  // Add general recommendations based on level
  if (stressLevel >= 7) {
    recommendations.push('Your stress level is high. Please consider speaking with a counselor, therapist, or trusted mentor. There is no shame in seeking professional support — it is a sign of strength.')
  }
  if (stressLevel <= 3) {
    recommendations.push('You\'re managing stress well! Continue your current habits and stay proactive about self-care.')
  }

  // Always add a mindfulness recommendation
  if (!recommendations.some(r => r.includes('breathing'))) {
    recommendations.push('Practice the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, exhale for 8. Do this 3-4 times when feeling stressed.')
  }

  const label = stressLevel <= 3 ? 'Low Stress' : stressLevel <= 6 ? 'Moderate Stress' : 'High Stress'
  const color = stressLevel <= 3 ? '#10b981' : stressLevel <= 6 ? '#f59e0b' : '#ef4444'

  return { stressLevel, label, color, insights, recommendations }
}

export default function StressChatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [questionIndex, setQuestionIndex] = useState(-1)
  const [responses, setResponses] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    // Start conversation
    setTimeout(() => {
      const q = QUESTIONS[0]
      setMessages([{ role: 'bot', text: q.text, type: q.type, options: q.options }])
      setQuestionIndex(0)
    }, 500)
  }, [])

  const addBotMessage = (text, extras = {}) => {
    return new Promise(resolve => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'bot', text, ...extras }])
        resolve()
      }, 600 + Math.random() * 800)
    })
  }

  const handleSend = async (customInput) => {
    const value = customInput || input.trim()
    if (!value || questionIndex < 0) return

    const currentQ = QUESTIONS[questionIndex]
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: value }])

    // Validate scale input
    if (currentQ.type === 'scale') {
      const num = parseInt(value)
      if (isNaN(num) || num < 1 || num > 10) {
        await addBotMessage("Please enter a number between 1 and 10.")
        return
      }
    }

    // Store response
    const newResponses = { ...responses, [currentQ.id]: value }
    setResponses(newResponses)

    // Get follow-up acknowledgement
    const followUp = currentQ.followUp(value)

    // Check if there are more questions
    const nextIndex = questionIndex + 1
    if (nextIndex < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextIndex]
      await addBotMessage(followUp + nextQ.text, { type: nextQ.type, options: nextQ.options })
      setQuestionIndex(nextIndex)
    } else {
      // All questions answered — generate diagnosis
      await addBotMessage(followUp + "Thank you for being so open with me. Let me analyze your responses...")

      setTimeout(() => {
        const result = analyzeResponses(newResponses)
        setDiagnosis(result)
        setMessages(prev => [...prev, { role: 'diagnosis', ...result }])
        setQuestionIndex(-2) // Done
      }, 1500)
    }
  }

  const reset = () => {
    setMessages([])
    setInput('')
    setQuestionIndex(-1)
    setResponses({})
    setDiagnosis(null)
    setIsTyping(false)
    setTimeout(() => {
      const q = QUESTIONS[0]
      setMessages([{ role: 'bot', text: q.text, type: q.type, options: q.options }])
      setQuestionIndex(0)
    }, 500)
  }

  const currentQ = questionIndex >= 0 ? QUESTIONS[questionIndex] : null
  const showInput = currentQ && (currentQ.type === 'open' || currentQ.type === 'scale')
  const showChoices = currentQ && currentQ.type === 'choice'
  const lastMsg = messages[messages.length - 1]
  const showOptions = showChoices && lastMsg?.role === 'bot' && lastMsg?.options

  return (
    <div className="max-w-lg mx-auto animate-enter flex flex-col" style={{ height: 'calc(100vh - 80px)', maxHeight: '700px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-600/10">
            <MessageCircle size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              AI Stress Counselor
              <Sparkles size={14} className="text-purple-400" />
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5">Conversational stress diagnosis</p>
          </div>
        </div>
        {questionIndex === -2 && (
          <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-[#131b2e] border border-slate-800 hover:bg-slate-800/40 transition-all text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <RotateCcw size={11} /> New Chat
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-[#131b2e] rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl p-3 sm:p-4 space-y-3 scrollbar-thin">
        {messages.map((msg, i) => {
          if (msg.role === 'diagnosis') return <DiagnosisCard key={i} {...msg} />

          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-3.5 py-2.5'
                  : 'bg-[#1e293b] text-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 border border-slate-700/30'
              }`}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          )
        })}

        {/* Choice buttons */}
        {showOptions && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {lastMsg.options.map((opt, i) => (
              <button key={i} onClick={() => handleSend(opt)}
                className="px-3 py-1.5 rounded-full bg-[#0B0F19] border border-slate-700/50 text-slate-300 text-[11px] font-medium hover:border-blue-500/40 hover:bg-blue-600/10 hover:text-blue-300 transition-all active:scale-[0.97]">
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1e293b] rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700/30">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {showInput && (
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="mt-2 flex gap-2">
          <input
            type={currentQ?.type === 'scale' ? 'number' : 'text'}
            min={currentQ?.type === 'scale' ? 1 : undefined}
            max={currentQ?.type === 'scale' ? 10 : undefined}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={currentQ?.type === 'scale' ? 'Enter 1-10...' : 'Type your response...'}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#131b2e] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
            autoFocus
            disabled={isTyping}
          />
          <button type="submit" disabled={!input.trim() || isTyping}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 transition-all active:scale-[0.96]">
            <Send size={14} />
          </button>
        </form>
      )}

      {questionIndex === -2 && (
        <div className="mt-2 text-center">
          <p className="text-[10px] text-slate-600">This is not a substitute for professional medical advice.</p>
        </div>
      )}
    </div>
  )
}

function DiagnosisCard({ stressLevel, label, color, insights, recommendations }) {
  return (
    <div className="space-y-3 animate-enter">
      {/* Score card */}
      <div className="bg-[#0B0F19] rounded-xl border border-slate-700/30 p-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3" style={{ background: `${color}15` }}>
          <span className="text-3xl font-bold" style={{ color }}>{stressLevel}</span>
        </div>
        <h3 className="text-sm font-bold text-white">{label}</h3>
        <p className="text-[11px] text-slate-400 mt-1">Stress Level: {stressLevel}/10</p>
        <div className="flex justify-center gap-0.5 mt-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-4 h-1.5 rounded-full" style={{
              backgroundColor: i < stressLevel ? color : 'rgba(255,255,255,0.05)',
              opacity: i < stressLevel ? 1 : 0.3,
            }} />
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-[#0B0F19] rounded-xl border border-slate-700/30 p-3.5">
          <h4 className="text-[11px] font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Brain size={12} className="text-purple-400" /> Key Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-2 pl-0.5">
                <div className="w-0.5 rounded-full bg-purple-500/40 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-[#0B0F19] rounded-xl border border-slate-700/30 p-3.5">
        <h4 className="text-[11px] font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Sparkles size={12} className="text-blue-400" /> Personalized Recommendations
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex gap-2 pl-0.5">
              <div className="w-0.5 rounded-full bg-blue-500/40 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
