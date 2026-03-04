import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { useNavigate } from "react-router-dom"
import Confetti from "react-confetti"

// Background image
const backgroundImage = "/assets/picnic-bg.jpg"

// Floating picnic items (you can add your own images in /public/assets)
const floatingItems = [
  "/assets/sandwich.png",
  "/assets/juice.png",
  "/assets/basket.png",
]

export default function FirstTimeWelcome({ session }) {
  const navigate = useNavigate()
  const [noPosition, setNoPosition] = useState({ top: "50%", left: "55%" })
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [itemsPositions, setItemsPositions] = useState(
    floatingItems.map(() => ({
      top: Math.random() * 80 + 10 + "%",
      left: Math.random() * 80 + 10 + "%",
      speed: Math.random() * 2 + 1,
    }))
  )

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Animate floating items
  useEffect(() => {
    const interval = setInterval(() => {
      setItemsPositions((prev) =>
        prev.map((item) => {
          let newTop = parseFloat(item.top) + item.speed
          if (newTop > 90) newTop = 10
          return { ...item, top: newTop + "%" }
        })
      )
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleNoHover = () => {
    const newTop = Math.random() * 60 + 20 + "%"
    const newLeft = Math.random() * 60 + 20 + "%"
    setNoPosition({ top: newTop, left: newLeft })
  }

  const handleYes = async () => {
    await supabase.auth.updateUser({
      data: { first_time_welcome: false },
    })
    navigate("/dashboard")
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Confetti */}
      <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} />

      {/* Floating picnic items */}
      {floatingItems.map((src, index) => (
        <img
          key={index}
          src={src}
          alt="picnic item"
          className="absolute w-16 h-16 animate-floating"
          style={{
            top: itemsPositions[index].top,
            left: itemsPositions[index].left,
          }}
        />
      ))}

      {/* Main content overlay */}
      <div className="bg-white/80 p-10 rounded-3xl shadow-2xl max-w-xl text-center animate-fadeIn">
        <h1 className="text-5xl font-extrabold mb-6 text-pink-500 drop-shadow-lg">
          🧺 Picnic Planner!
        </h1>
        <p className="text-xl mb-8 text-purple-700 drop-shadow-sm">
          Welcome {session.user.user_metadata.full_name || "User"}! <br />
          Are you excited to plan amazing picnics with your friends?
        </p>

        <div className="relative h-32 flex items-center justify-center">
          <button
            className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-green-600 text-2xl transition-transform transform hover:scale-110"
            onClick={handleYes}
          >
            Yes!
          </button>

          <button
            style={{
              position: "absolute",
              top: noPosition.top,
              left: noPosition.left,
            }}
            className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-lg text-2xl transition-transform transform hover:scale-110"
            onMouseEnter={handleNoHover}
          >
            No
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 text-yellow-400 font-bold text-xl animate-bounce drop-shadow-md">
        Move your mouse over "No" to try catching it! 😎
      </div>
    </div>
  )
}