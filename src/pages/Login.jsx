import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Zap, Shield, BarChart3, Brain } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="hidden lg:block animate-enter">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6">
              <Zap size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Smart Dashboard</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">PaoTabs</h1>
            <p className="text-lg text-slate-400 mt-4 leading-relaxed max-w-md">
              Your all-in-one command center for productivity and wellness. Track tasks, monitor stress, and own your progress.
            </p>
          </div>

          <div className="space-y-3 stagger">
            <FeatureRow icon={BarChart3} title="Task Management" desc="Kanban boards, priorities, deadlines" />
            <FeatureRow icon={Brain} title="Stress Assessment" desc="Track wellness with smart check-ins" />
            <FeatureRow icon={Shield} title="Secure & Private" desc="Your data stays yours with Supabase RLS" />
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="animate-enter" style={{ animationDelay: '0.1s' }}>
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-white">PaoTabs</h1>
            <p className="text-slate-400 mt-2">Productivity & wellness dashboard</p>
          </div>

          <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {isSignUp ? 'Start your journey to better productivity' : 'Sign in to access your dashboard'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                    placeholder="Paolo Tabuso"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
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
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span className="font-bold text-blue-400">{isSignUp ? 'Sign in' : 'Sign up'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-center gap-4 bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl px-5 py-4">
      <div className="p-2.5 rounded-xl bg-blue-600/10 flex-shrink-0">
        <Icon size={20} className="text-blue-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  )
}
