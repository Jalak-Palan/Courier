import { useState, useRef } from 'react'
import TrackingModal from './TrackingModal'

const COURIER_URLS = {
  'Trackon': 'https://www.trackon.in/',
  'DTDC': 'https://www.dtdc.com/track-your-shipment/',
  'Shree Maruti': 'https://shreemaruti.com/track-shipment/',
  'Shree Anjani': 'https://shreeanjanicouriertracking.com/',
  'Shree Nandan': 'https://www.shreenandancourier.com/'
}

const MOCK_SHIPMENTS = [
  { id: 'TRK992831', courier: 'DTDC', status: 'In Transit', origin: 'Mumbai', destination: 'Delhi', progress: 65, date: '21 April 2026' },
  { id: 'SM882193', courier: 'Shree Maruti', status: 'Delivered', origin: 'Ahmedabad', destination: 'Surat', progress: 100, date: '19 April 2026' },
  { id: 'TN441029', courier: 'Trackon', status: 'Picked Up', origin: 'Rajkot', destination: 'Pune', progress: 15, date: '22 April 2026' },
]

const MOCK_HISTORY = [
  { id: 'TRK001223', courier: 'DTDC', status: 'Completed', date: '18 April 2026', time: '10:30 AM' },
  { id: 'TRK551224', courier: 'Trackon', status: 'Completed', date: '17 April 2026', time: '02:15 PM' },
  { id: 'SA110293', courier: 'Shree Anjani', status: 'Cancelled', date: '16 April 2026', time: '09:45 AM' },
]

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tracking') // tracking | shipments | history
  const [trackingId, setTrackingId] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('Trackon')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle') // idle | loading | result
  const [trackingResult, setTrackingResult] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const abortControllerRef = useRef(null)

  const handleTrack = async (isRetry = false) => {
    if (!isRetry) {
      setError('')
      setTrackingResult(null)
    }
    
    if (!trackingId.trim()) {
      setError('Please enter a Tracking ID to continue.')
      return
    }

    // Initialize abort controller
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    setPhase('loading')
    try {
      // Use TEMPORARY HARD FIX URL as requested
      const url = `https://courier-1-oidr.onrender.com/track?id=${encodeURIComponent(trackingId.trim())}&courier=${encodeURIComponent(selectedCourier)}`;
      
      const res = await fetch(url, {
        signal: abortControllerRef.current.signal,
        // Optional: you could add a custom timeout here if desired
      })
      const data = await res.json()
      
      // Handle the array response (new reliable format) or object response
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // If empty and not already retrying, try one more time after 2 seconds
          if (!isRetry) {
            console.log('Empty response, retrying in 2 seconds...')
            setTimeout(() => handleTrack(true), 2000)
            return
          }
          setTrackingResult({ error: 'No Data Found', message: 'Tracking details not found for this ID.' })
        } else {
          setTrackingResult({ 
            courier: selectedCourier,
            history: data,
            consignmentNumber: trackingId.trim(),
            dueDate: 'N/A'
          })
        }
      } else {
        // Handle object response (backward compatibility)
        if (data.error || !data.history || data.history.length === 0) {
           if (!isRetry) {
             setTimeout(() => handleTrack(true), 2000)
             return
           }
        }
        setTrackingResult(data)
      }
      setPhase('result')
    } catch (err) {
      if (err.name === 'AbortError') return
      
      // Retry on network error once
      if (!isRetry) {
        setTimeout(() => handleTrack(true), 2000)
        return
      }

      setTrackingResult({ error: 'Network error', message: 'Could not connect to tracking server.' })
      setPhase('result')
    } finally {
      abortControllerRef.current = null
    }
  }

  const handleCancelSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setPhase('idle')
    setTrackingResult(null)
    setError('')
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

  const renderTrackingView = () => (
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
            <span className="text-sm">⚠️</span> {error}
          </div>
        )}

        {phase === 'result' && trackingResult && (
          <div className={`mt-6 rounded-2xl border p-5 sm:p-6 animate-card ${trackingResult.error ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            {trackingResult.error ? (
              <div className="flex items-start gap-4 text-red-700">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-lg shrink-0">⚠️</div>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-0.5">Tracking Unavailable</p>
                  <p className="text-xs">{trackingResult.message || 'Error occurred.'}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📦</div>
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">Shipment History</p>
                      <p className="text-emerald-600 text-[10px] font-mono uppercase tracking-widest">{trackingResult.courier}</p>
                    </div>
                  </div>
                  <button onClick={handleReset} className="text-[10px] font-bold px-4 py-2 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm">New Search</button>
                </div>

                {trackingResult.courier === 'Trackon' && trackingResult.history ? (
                  <div className="space-y-6">
                    {/* Summary Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1 tracking-wider">Consignment Number</p>
                        <p className="font-bold text-gray-900 text-sm">{trackingResult.consignmentNumber || trackingId}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1 tracking-wider">Due Date</p>
                        <p className="font-bold text-gray-900 text-sm">{trackingResult.dueDate || 'N/A'}</p>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-orange-500">
                              <th className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-widest">Date & Time</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-widest">Transaction No</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-widest">Location</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-widest">Event</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trackingResult.history.length > 0 ? (
                              trackingResult.history.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-0 hover:bg-emerald-50/30 transition-colors`}>
                                  <td className="px-6 py-4 text-xs font-medium text-gray-700">{row.date}</td>
                                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{row.transaction}</td>
                                  <td className="px-6 py-4 text-xs text-gray-600">{row.location}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-emerald-700">{row.event}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-medium italic text-sm">No tracking data found for this ID.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center sm:text-left">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Status</p>
                      <p className="font-bold text-gray-900 text-sm">{trackingResult.status}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center sm:text-left">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Location</p>
                      <p className="font-bold text-gray-900 text-sm">{trackingResult.location}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center sm:text-left">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Date</p>
                      <p className="font-bold text-gray-900 text-sm">{trackingResult.date}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
        <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Service Reliability</h3>
          <div className="flex flex-col gap-5 sm:gap-6">
            {[
              { val: '99.8%', label: 'Delivery Rate', icon: '✅', color: 'bg-green-50 text-green-600' },
              { val: '150+', label: 'Cities Covered', icon: '🗺️', color: 'bg-blue-50 text-blue-600' },
              { val: '24/7', label: 'Global Support', icon: '🎧', color: 'bg-purple-50 text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-gray-900">{s.val}</div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Current Network</h3>
           <div className="space-y-4">
             <p className="text-base sm:text-lg font-medium leading-relaxed">Our fleet of <span className="text-emerald-400 font-bold">400+ trucks</span> is active nation-wide.</p>
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 w-fit">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">Live Traffic Updates</span>
             </div>
           </div>
           <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
             <span className="text-3xl">🚀</span>
             <button className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest">View Map →</button>
           </div>
        </div>
      </div>
    </div>
  )

  const renderShipmentsView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 animate-card w-full">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Active Shipments</h2>
        <p className="text-gray-500">Monitor your outgoing and incoming parcels in real-time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {MOCK_SHIPMENTS.map((ship, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${ship.status === 'Delivered' ? 'bg-green-400' : 'bg-emerald-400'}`} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">📦</div>
                <div>
                  <h4 className="font-bold text-gray-900">{ship.id}</h4>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">{ship.courier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  ship.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {ship.status}
                </span>
                <span className="text-xs font-bold text-gray-400">{ship.date}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <span>{ship.origin}</span>
                  <span>{ship.destination}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${ship.progress}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-center sm:text-right">
                <p className="text-2xl font-black text-gray-900">{ship.progress}%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Details</button>
              <button className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-100">Live Map</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderHistoryView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 animate-card w-full">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Search History</h2>
        <p className="text-gray-500">Quickly revisit your previous tracking inquiries.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Courier</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((item, idx) => (
                <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">📦</div>
                      <span className="font-bold text-gray-900 text-sm">{item.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-500">{item.courier}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{item.date}</span>
                      <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      item.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setTrackingId(item.id);
                        setSelectedCourier(item.courier);
                        setActiveTab('tracking');
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

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
            <button 
              onClick={() => setActiveTab('tracking')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'tracking' ? 'bg-white shadow-sm border border-gray-100 text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-white font-medium'
              } text-sm`}
            >
              <span className="text-lg">📦</span> Tracking
            </button>
            <button 
              onClick={() => setActiveTab('shipments')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'shipments' ? 'bg-white shadow-sm border border-gray-100 text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-white font-medium'
              } text-sm`}
            >
              <span className="text-lg">🚛</span> Shipments
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'history' ? 'bg-white shadow-sm border border-gray-100 text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-white font-medium'
              } text-sm`}
            >
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
                <span className="text-emerald-700">Gf-03, Simandhar Avenue, Bhadaj-Santej Road, Opp. IOC Petrol Pump, Rakanpur-382721, Gandhinagar</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                {user.charAt(0)}
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
            <div className="w-8 h-8 flex items-center justify-center rounded-lg shadow-md border border-gray-100 overflow-hidden bg-white">
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

        {activeTab === 'tracking' && renderTrackingView()}
        {activeTab === 'shipments' && renderShipmentsView()}
        {activeTab === 'history' && renderHistoryView()}

        <div className="mt-auto">
          <footer className="text-center py-6 sm:py-8 border-t border-gray-100 bg-gray-50/30">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              © 2024 Prime Plus Enterprise
            </p>
          </footer>
        </div>
      </main>

      {/* Loading modal */}
      {phase === 'loading' && (
        <TrackingModal 
          phase="loading" 
          trackingId={trackingId} 
          onCancel={handleCancelSearch}
        />
      )}
    </div>
  )
}
