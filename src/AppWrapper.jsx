import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import FirstTimeWelcome from "./FirstTimeWelcome"
import Dashboard from "./Dashboard"

export default function AppWrapper() {
  const [session, setSession] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        const firstTime = data.session.user.user_metadata.first_time_welcome
        setShowWelcome(firstTime !== false)
      }
    }
    fetchSession()
  }, [])

  if (!session) return null // or loader

  return showWelcome ? (
    <FirstTimeWelcome session={session} />
  ) : (
    <Dashboard session={session} />
  )
}