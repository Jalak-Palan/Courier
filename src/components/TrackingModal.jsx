export default function TrackingModal({ phase, trackingId }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="animate-card w-full max-w-sm rounded-[2.5rem] p-10 text-center bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
      >
        {phase === 'loading' && (
          <>
            {/* Spinner */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="spinner" />
              <div
                className="absolute inset-0 m-auto w-7 h-7 rounded-full"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              />
              <span className="absolute text-lg">📦</span>
            </div>
            <h2 className="text-gray-900 font-extrabold text-xl mb-2">Locating Parcel</h2>
            <p className="text-gray-500 text-sm mb-6">Searching tracking database</p>
            <div
              className="inline-block font-mono text-sm px-4 py-2 rounded-xl text-indigo-600 mb-6 bg-indigo-50 border border-indigo-100"
            >
              {trackingId}
            </div>
            {/* Progress bar */}
            <div className="w-full rounded-full h-2 overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: '70%',
                  background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  animation: 'shimmer 1.5s linear infinite',
                  backgroundSize: '200% auto',
                }}
              />
            </div>
            <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">Securing connection...</p>
          </>
        )}

        {phase === 'redirecting' && (
          <>
            <div className="flex items-center justify-center mb-8">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/20"
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                }}
              >
                🚀
              </div>
            </div>
            <h2 className="text-gray-900 font-extrabold text-xl mb-2">Parcel Found!</h2>
            <p className="text-indigo-600 text-sm font-bold mb-6">
              Redirecting to official partner...
            </p>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {[0, i, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-500"
                  style={{ animation: `bounceDot 1.4s ${i * 0.16}s infinite ease-in-out both` }}
                />
              ))}
            </div>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-green-600 bg-green-50 border border-green-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SECURE LINK VERIFIED
            </div>
          </>
        )}
      </div>
    </div>
  )
}
