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
      .eq("user_id", session.user.id) // show only logged-in user's attendees
      .order("created_at", { ascending: false })

    setAttendees(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addAttendee = async () => {
    if (!name.trim() || !food.trim()) return

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
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage:
          "url('/assets/picnic-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Glass Card */}
      <div className="w-full max-w-2xl backdrop-blur-md bg-white/70 p-8 rounded-3xl shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-800">
            🌿 Welcome, {session.user.user_metadata?.full_name || "Picnic Lover"}!
          </h1>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Add Attendee Section */}
        <div className="mb-8 bg-white/80 p-5 rounded-2xl shadow-inner">
          <h2 className="font-semibold mb-4 text-green-700 text-lg">
            🧺 Add a Picnic Buddy
          </h2>

          <input
            placeholder="Friend's Name"
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Food They Bring 🍉"
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={food}
            onChange={(e) => setFood(e.target.value)}
          />

          <button
            onClick={addAttendee}
            className="w-full bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition transform hover:scale-105"
          >
            Add to Picnic 🎉
          </button>
        </div>

        {/* Attendees List */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-green-700">
            🎈 Picnic Guests ({attendees.length})
          </h2>

          {attendees.length === 0 ? (
            <div className="text-center text-gray-600 bg-white/70 p-6 rounded-xl shadow">
              <p className="text-lg">No picnic buddies yet 🥲</p>
              <p className="text-sm mt-1">Add someone to start the fun!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendees.map((a, index) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl shadow-md flex justify-between items-center transition transform hover:scale-105 ${
                    index === 0 ? "bg-yellow-100" : "bg-white"
                  }`}
                >
                  <span className="font-semibold text-green-800">
                    {a.name}
                  </span>
                  <span className="text-gray-700">
                    🍱 {a.food_item}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}