import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import { useNavigate } from "react-router-dom"

export default function Dashboard({ session }) {
  const [attendees, setAttendees] = useState([])
  const [name, setName] = useState("")
  const [food, setFood] = useState("")
  const navigate = useNavigate()

  const fetchData = async () => {
    const { data } = await supabase
      .from("attendees")
      .select("*")
      .order("created_at", { ascending: false })

    setAttendees(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addAttendee = async () => {
    if (!name || !food) return

    await supabase.from("attendees").insert([
      {
        name,
        food_item: food,
        user_id: session.user.id,
      },
    ])

    setName("")
    setFood("")
    fetchData()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Dashboard</h2>
          <button
            onClick={logout}
            className="text-red-500"
          >
            Logout
          </button>
        </div>

        <div className="mb-4">
          <input
            placeholder="Name"
            className="w-full p-2 border rounded mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Food Item"
            className="w-full p-2 border rounded mb-2"
            value={food}
            onChange={(e) => setFood(e.target.value)}
          />
          <button
            onClick={addAttendee}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Add Attendee
          </button>
        </div>

        {attendees.map((a) => (
          <div key={a.id} className="border-b py-2">
            {a.name} - {a.food_item}
          </div>
        ))}
      </div>
    </div>
  )
}