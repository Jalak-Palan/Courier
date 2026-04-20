import { useState } from 'react'
import TrackingModal from './TrackingModal'

const COURIER_URLS = {
  'Trackon': 'https://www.trackon.in/',
  'DTDC': 'https://www.dtdc.com/track-your-shipment/',
  'Shree Maruti': 'https://shreemaruti.com/track-shipment/',
  'Shree Anjani': 'https://shreeanjanicouriertracking.com/',
  'Shree Nandan': 'https://www.shreenandancourier.com/'
}

export default function Dashboard({ user, onLogout }) {
  const [trackingId, setTrackingId] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('Trackon')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle') // idle | loading | result
  const [trackingResult, setTrackingResult] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleTrack = async () => {
    setError('')
    setTrackingResult(null)
    if (!trackingId.trim()) {
      setError('Please enter a Tracking ID to continue.')
      return
    }
    setPhase('loading')
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: trackingId.trim(), courier: selectedCourier }),
      })
      const data = await res.json()
      setTrackingResult(data)
      setPhase('result')
    } catch (_err) {
      setTrackingResult({ error: 'Network error', message: 'Could not connect to tracking server. Please check your connection.' })
      setPhase('result')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTrack()
  }

  const handleReset = () => {
    setPhase('idle')
    setTrackingResult(null)
    setError('')
    setTrackingId('')
  }

  return (
    <div className="min-h-screen flex bg-white text-gray-900 font-inter relative overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-50 border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl shadow-lg border-2 border-white overflow-hidden"
                style={{ background: 'white' }}
              >
                <img src="/logo.png" alt="Prime Plus Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-sm leading-tight">Prime Plus</span>
                <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-tighter">Enterprise</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-gray-100 text-emerald-600 font-semibold text-sm transition-all">
              <span className="text-lg">📦</span> Tracking
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium text-left">
              <span className="text-lg">🚛</span> Shipments
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium text-left">
              <span className="text-lg">📜</span> History
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest mb-3">Contact Details</h4>
            <div className="space-y-3">
              <a href="mailto:iwaylogistic.santej@gmail.com" className="flex items-center gap-2 text-[10px] text-emerald-700 hover:underline">
                <span className="text-sm">✉️</span> iwaylogistic.santej@gmail.com
              </a>
              <a href="tel:8487960788" className="flex items-center gap-2 text-[10px] text-emerald-700 hover:underline">
                <span className="text-sm">📞</span> +91 8487960788
              </a>
              <div className="flex gap-2 text-[9px] text-emerald-800 leading-relaxed font-medium">
                <span className="text-sm shrink-0">📍</span> 
                <span>
                  Gf-03, Simandhar Avenue, Bhadaj-Santej Road, Opp. IOC Petrol Pump, Rakanpur-382721, Gandhinagar
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
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
      <main className="flex-1 relative h-screen overflow-y-auto bg-white flex flex-col">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg shadow-md border border-gray-100 overflow-hidden"
              style={{ background: 'white' }}
            >
              <img src="/logo.png" alt="Prime Plus Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-900 font-bold text-sm uppercase tracking-tight">Prime Plus</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 animate-card w-full">
          
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 mb-12 sm:mb-16">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                Premium Delivery Service
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.2] sm:leading-[1.1] mb-6">
                Your Logistic Partner for <span className="text-emerald-600">Best Service</span>
              </h1>
              <p className="text-gray-500 text-base sm:text-lg mb-0 max-w-lg mx-auto md:mx-0">
                We provide the most reliable tracking system for your parcels and heavy trucks. Swift, secure, and always on time.
              </p>
            </div>
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-emerald-500 rounded-[2rem] sm:rounded-3xl blur-2xl opacity-10 sm:opacity-20 group-hover:opacity-30 transition-opacity" />
              <img 
                src="/hero.png" 
                alt="Courier Truck and Parcel" 
                className="relative rounded-[2rem] sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 object-cover w-full h-[220px] sm:h-[300px]"
              />
            </div>
          </div>

          {/* Tracking Box */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 mb-10 sm:mb-12 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🔍</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Track your Parcel</h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Enter your unique tracking ID below</p>
                </div>
              </div>
              
              {/* Courier Selection Dropdown */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  disabled={phase === 'loading'}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-white border border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {Object.keys(COURIER_URLS).map(courier => (
                    <option key={courier} value={courier}>{courier}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={trackingId}
                  onChange={e => { 
                    const val = e.target.value;
                    setTrackingId(val); 
                    setError('');
                    setTrackingResult(null);
                    if (phase === 'result') setPhase('idle');
                    // Auto-detection logic
                    const upperVal = val.toUpperCase();
                    if (upperVal.startsWith('SM')) setSelectedCourier('Shree Maruti');
                    else if (upperVal.startsWith('SA')) setSelectedCourier('Shree Anjani');
                    else if (upperVal.startsWith('SN')) setSelectedCourier('Shree Nandan');
                    else if (/^[A-Z]\d{8}/.test(upperVal)) setSelectedCourier('DTDC');
                    else if (/^\d{9}$/.test(val)) setSelectedCourier('Trackon');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. TRK2024ABCD"
                  disabled={phase === 'loading'}
                  className="w-full pl-12 pr-6 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 shadow-sm"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={phase === 'loading'}
                className="flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-white text-sm sm:text-base tracking-wide transition-all hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 shimmer-btn"
                style={{ background: 'linear-gradient(90deg, #10b981, #059669, #10b981)' }}
              >
                {phase === 'loading' ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <span>Track Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-[11px] sm:text-sm text-red-600 bg-red-50 border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* ── Tracking Result Card ── */}
            {phase === 'result' && trackingResult && (
              <div className={`mt-6 rounded-2xl border p-5 sm:p-6 animate-card ${
                trackingResult.error ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
              }`}>
                {trackingResult.error ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-lg shrink-0">⚠️</div>
                    <div className="flex-1">
                      <p className="font-bold text-red-700 text-sm mb-0.5">Tracking Unavailable</p>
                      <p className="text-red-600 text-xs leading-relaxed">
                        {trackingResult.message || 'Could not fetch tracking data. The courier website may be slow or unavailable.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={handleReset}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Try again
                        </button>
                        <a
                          href={COURIER_URLS[selectedCourier]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
                        >
                          Visit {selectedCourier} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📦</div>
                        <div>
                          <p className="font-bold text-emerald-900 text-sm">Live Tracking Result</p>
                          <p className="text-emerald-600 text-[10px] font-mono uppercase tracking-widest">{trackingResult.courier}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        New Search
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-bold text-gray-900 text-sm leading-snug">{trackingResult.status}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Location</p>
                        <p className="font-bold text-gray-900 text-sm leading-snug">{trackingResult.location}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-bold text-gray-900 text-sm leading-snug">{trackingResult.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl bg-emerald-100/60">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <p className="text-[10px] font-semibold text-emerald-800">
                        Live data fetched from {trackingResult.courier} — ID: <span className="font-mono">{trackingId}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
            <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8 text-center sm:text-left">Service Reliability</h3>
              <div className="flex flex-col gap-5 sm:gap-6">
                {[
                  { val: '99.8%', label: 'Delivery Rate', icon: '✅', color: 'bg-green-50 text-green-600' },
                  { val: '150+', label: 'Cities Covered', icon: '🗺️', color: 'bg-blue-50 text-blue-600' },
                  { val: '24/7', label: 'Global Support', icon: '🎧', color: 'bg-purple-50 text-purple-600' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl ${s.color}`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-gray-900">{s.val}</div>
                      <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
               <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center sm:text-left">Current Network</h3>
               <div className="space-y-4 relative z-10 text-center sm:text-left">
                 <p className="text-base sm:text-lg font-medium leading-relaxed">
                   Our fleet of <span className="text-emerald-400 font-bold">400+ trucks</span> is active across the nation.
                 </p>
                 <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-widest">Live Traffic Updates</span>
                 </div>
               </div>
               <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                 <span className="text-3xl">🚀</span>
                 <button className="text-[10px] sm:text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors">
                   View Logistics Map →
                 </button>
               </div>
            </div>
          </div>

          <footer className="text-center py-6 sm:py-8 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              © 2024 Prime Plus Enterprise
            </p>
          </footer>
        </div>
      </main>

      {/* Loading modal — shown while Puppeteer backend is scraping */}
      {phase === 'loading' && (
        <TrackingModal phase="loading" trackingId={trackingId} />
      )}
    </div>
  )
}
