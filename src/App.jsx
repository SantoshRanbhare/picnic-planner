import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { supabase } from "./supabase"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import ProtectedRoute from "./ProtectedRoute"

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
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