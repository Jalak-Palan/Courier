export default function TrackingModal({ phase, trackingId, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
      style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="animate-card w-full max-w-[90%] sm:max-w-sm rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-center bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] my-auto"
      >
        {phase === 'loading' && (
          <>
            {/* Spinner */}
            <div className="relative flex items-center justify-center mb-6 sm:mb-8">
              <div className="spinner w-10 h-10 sm:w-12 sm:h-12" />
              <div
                className="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              />
              <span className="absolute text-base sm:text-lg">📦</span>
            </div>
            <h2 className="text-gray-900 font-extrabold text-lg sm:text-xl mb-1 sm:mb-2">Locating Parcel</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">Searching tracking database</p>
            <div
              className="inline-block font-mono text-[11px] sm:text-sm px-4 py-2 rounded-xl text-indigo-600 mb-5 sm:mb-6 bg-indigo-50 border border-indigo-100"
            >
              {trackingId}
            </div>
            {/* Progress bar */}
            <div className="w-full rounded-full h-1.5 sm:h-2 overflow-hidden bg-gray-100 mb-8">
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
            
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100 active:scale-95"
            >
              Cancel Search
            </button>
            <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest leading-none">Securing connection...</p>
          </>
        )}

        {phase === 'redirecting' && (
          <>
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-indigo-500/20"
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                }}
              >
                🚀
              </div>
            </div>
            <h2 className="text-gray-900 font-extrabold text-lg sm:text-xl mb-1 sm:mb-2">Parcel Found!</h2>
            <p className="text-indigo-600 text-xs sm:text-sm font-bold mb-5 sm:mb-6">
              Redirecting to official courier website...
            </p>
            <div className="flex items-center justify-center gap-1.5 mb-5 sm:mb-6">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500"
                  style={{ animation: `bounceDot 1.4s ${i * 0.16}s infinite ease-in-out both` }}
                />
              ))}
            </div>
            <div
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 border border-green-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
