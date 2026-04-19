import { useState } from 'react'
import TrackingModal from './TrackingModal'

const TRACKING_URL = 'https://trackcourier.io/trackon-courier-tracking'

const steps = [
  { icon: '📦', label: 'Order Placed', time: 'Day 1', done: true },
  { icon: '🏭', label: 'At Warehouse', time: 'Day 2', done: true },
  { icon: '🚚', label: 'In Transit', time: 'Day 3', done: true },
  { icon: '🏠', label: 'Out for Delivery', time: 'Today', done: false },
]

export default function Dashboard({ user, onLogout }) {
  const [trackingId, setTrackingId] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle') // idle | loading | redirecting

  const handleTrack = () => {
    setError('')
    if (!trackingId.trim()) {
      setError('Please enter a Tracking ID to continue.')
      return
    }
    setPhase('loading')
    setTimeout(() => {
      setPhase('redirecting')
      setTimeout(() => {
        window.open(TRACKING_URL, '_blank', 'noopener,noreferrer')
        setPhase('idle')
        setTrackingId('')
      }, 1200)
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTrack()
  }

  return (
    <div className="min-h-screen flex bg-white text-gray-900 font-inter">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col sticky top-0 h-screen bg-gray-50/50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2 4H6l-2-4m16 0H4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-base leading-tight">SwiftTrack</span>
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-tighter">Courier Service</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-gray-100 text-indigo-600 font-semibold text-sm transition-all">
              <span className="text-lg">📦</span> Tracking
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium">
              <span className="text-lg">🚛</span> Shipments
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium">
              <span className="text-lg">📜</span> History
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          {/* Contact Me Section */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">Contact Me</h4>
            <div className="space-y-2">
              <a href="mailto:support@swifttrack.com" className="flex items-center gap-2 text-xs text-indigo-700 hover:underline">
                <span className="text-sm">✉️</span> Email Support
              </a>
              <a href="tel:+123456789" className="flex items-center gap-2 text-xs text-indigo-700 hover:underline">
                <span className="text-sm">📞</span> +1 234 567 89
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {user.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-700">{user}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12 animate-card">
          
          {/* Hero Section with Image */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                Premium Delivery Service
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                Your Logistic Partner for <span className="text-indigo-600">Best Service</span>
              </h1>
              <p className="text-gray-500 text-lg mb-0 max-w-lg">
                We provide the most reliable tracking system for your parcels and heavy trucks. Swift, secure, and always on time.
              </p>
            </div>
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <img 
                src="/hero.png" 
                alt="Courier Truck and Parcel" 
                className="relative rounded-3xl shadow-2xl border border-gray-100 object-cover w-full h-[300px]"
              />
            </div>
          </div>

          {/* Tracking Box */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 mb-12 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🔍</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Track your Parcel</h2>
                <p className="text-gray-500 text-sm">Enter your unique tracking ID below</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={trackingId}
                  onChange={e => { setTrackingId(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. TRK2024ABCD1234"
                  disabled={phase !== 'idle'}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl text-base text-gray-900 placeholder-gray-400 border border-gray-200 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 shadow-sm"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={phase !== 'idle'}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base tracking-wide transition-all hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 shimmer-btn"
              >
                {phase === 'idle' ? (
                  <>
                    <span>Track Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>In Progress...</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Shipment Journey Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Service Reliability</h3>
              <div className="flex flex-col gap-6">
                {[
                  { val: '99.8%', label: 'Delivery Rate', icon: '✅', color: 'bg-green-50 text-green-600' },
                  { val: '150+', label: 'Cities Covered', icon: '🗺️', color: 'bg-blue-50 text-blue-600' },
                  { val: '24/7', label: 'Global Support', icon: '🎧', color: 'bg-purple-50 text-purple-600' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${s.color}`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-xl font-black text-gray-900">{s.val}</div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Current Network</h3>
               <div className="space-y-4 relative z-10">
                 <p className="text-lg font-medium leading-relaxed">
                   Our fleet of <span className="text-indigo-400 font-bold">400+ trucks</span> is active across the nation.
                 </p>
                 <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-xs font-medium text-gray-300">Live Traffic Updates Enabled</span>
                 </div>
               </div>
               <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                 <span className="text-3xl">🚀</span>
                 <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                   View Logistics Map →
                 </button>
               </div>
            </div>
          </div>

          <footer className="text-center py-8 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              © 2024 SwiftTrack Courier Service • Premium Logistics Partner
            </p>
          </footer>
        </div>
      </main>

      {/* Loading / Redirecting modal */}
      {phase !== 'idle' && (
        <TrackingModal phase={phase} trackingId={trackingId} />
      )}
    </div>
  )
}
