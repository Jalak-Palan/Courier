import { useState } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState('')

  const handleLogin = (username) => {
    setUser(username)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser('')
  }

  return (
    <div className="min-h-screen">
      {!isLoggedIn
        ? <LoginPage onLogin={handleLogin} />
        : <Dashboard user={user} onLogout={handleLogout} />
      }
    </div>
  )
}

export default App
