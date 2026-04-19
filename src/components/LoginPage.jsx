import { useState } from 'react'

const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'courier123'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      setError('Invalid username or password.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin(username)
    }, 1200)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden bg-white"
    >
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full opacity-20 sm:opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e0e7ff, transparent)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full opacity-15 sm:opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f3e8ff, transparent)' }} />
      
      {/* Hero Image background (subtle) */}
      <img src="/hero.png" alt="Courier Hero" className="absolute w-full h-full object-cover opacity-5 pointer-events-none" />

      {/* Card */}
      <div
        className="animate-card relative w-full max-w-[95%] sm:max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-xl"
      >
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
          <div className="relative mb-3 sm:mb-4">
            <div
              className="pulse-ring absolute inset-0 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)' }}
            />
            <div
              className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2 4H6l-2-4m16 0H4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v.01" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">SwiftTrack Courier</h1>
          <p className="text-[10px] sm:text-sm text-indigo-600 mt-1 font-medium tracking-wide uppercase">Your Trusted Delivery Partner</p>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Welcome back</h2>
        <p className="text-[11px] sm:text-sm text-gray-500 mb-5 sm:mb-6">Sign in to access your tracking dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 sm:py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] sm:text-sm text-red-600 bg-red-50 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-white text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mt-2 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed shimmer-btn"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Demo: <span className="text-indigo-500 font-bold font-mono">admin</span> / <span className="text-indigo-500 font-bold font-mono">courier123</span></p>
        </div>
      </div>
    </div>
  )
}
