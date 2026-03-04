import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { supabase } from "./supabase"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import FirstTimeWelcome from "./FirstTimeWelcome"
import ProtectedRoute from "./ProtectedRoute"

function App() {
  const [session, setSession] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [loading, setLoading] = useState(true) // show loader while checking session

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        const firstTime = data.session.user.user_metadata.first_time_welcome
        setShowWelcome(firstTime !== false) // show welcome if undefined or true
      }
      setLoading(false)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          const firstTime = session.user.user_metadata.first_time_welcome
          setShowWelcome(firstTime !== false)
        } else {
          setShowWelcome(false)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute session={session}>
              {showWelcome ? (
                <FirstTimeWelcome session={session} />
              ) : (
                <Dashboard session={session} />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App