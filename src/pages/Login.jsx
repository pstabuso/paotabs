import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Sparkles, Shield, BarChart3, Brain } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName)
      if (error) setError(error.message)
      else setSuccess('Check your email for a confirmation link!')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4 relative overflow-hidden noise">
      {/* Ambient background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/[0.07] blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/[0.04] blur-[100px] animate-float" style={{ animationDelay: '-1.5s' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Branding */}
        <div className="hidden lg:block animate-enter">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs font-medium text-indigo-300">Smart Personal Dashboard</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-tight">
              <span className="text-gradient">PaoTabs</span>
            </h1>
            <p className="text-lg text-slate-400 mt-4 leading-relaxed max-w-md">
              Your all-in-one command center for productivity and wellness. Track tasks, monitor stress, and own your progress.
            </p>
          </div>

          <div className="space-y-4 stagger">
            <FeatureRow icon={BarChart3} color="text-indigo-400" bg="bg-indigo-500/10" title="Task Management" desc="Kanban boards, priorities, deadlines" />
            <FeatureRow icon={Brain} color="text-purple-400" bg="bg-purple-500/10" title="Stress Assessment" desc="Track wellness with smart check-ins" />
            <FeatureRow icon={Shield} color="text-emerald-400" bg="bg-emerald-500/10" title="Secure & Private" desc="Your data stays yours with Supabase RLS" />
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="animate-enter" style={{ animationDelay: '0.1s' }}>
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gradient">PaoTabs</h1>
            <p className="text-slate-400 mt-2">Productivity & wellness dashboard</p>
          </div>

          <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-bold text-slate-100 mb-1">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {isSignUp ? 'Start your journey to better productivity' : 'Sign in to access your dashboard'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0F19]/80 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Paolo Tabuso"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0F19]/80 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0F19]/80 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 group"
                style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
                className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span className="font-medium text-indigo-400">{isSignUp ? 'Sign in' : 'Sign up'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ icon: Icon, color, bg, title, desc }) {
  return (
    <div className="flex items-center gap-4 glass rounded-2xl px-5 py-4 glow-border">
      <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  )
}
