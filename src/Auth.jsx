import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { useNavigate } from "react-router-dom"

function Toast({ message, type, onClose }) {
  if (!message) return null
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
      <span className="ml-2 cursor-pointer font-bold" onClick={onClose}>
        ×
      </span>
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState(localStorage.getItem("savedEmail") || "")
  const [password, setPassword] = useState(localStorage.getItem("savedPassword") || "")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true")
  const [toast, setToast] = useState({ message: "", type: "success" })

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) navigate("/app") // ✅ FIXED
    }
    checkSession()
  }, [navigate])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: "", type: "success" })
    }, 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      showToast("Email and password required", "error")
      setLoading(false)
      return
    }

    // ======================
    // SIGNUP
    // ======================
    if (!isLogin) {
      if (!name.trim()) {
        showToast("Name is required", "error")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match", "error")
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            first_time_welcome: true, // ✅ important
          },
        },
      })

      if (error) {
        showToast(error.message, "error")
        setLoading(false)
        return
      }

      await supabase.auth.signInWithPassword({
        email,
        password,
      })

      navigate("/app") // ✅ FIXED
      setLoading(false)
      return
    }

    // ======================
    // LOGIN
    // ======================
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      showToast(loginError.message, "error")
      setLoading(false)
      return
    }

    if (rememberMe) {
      localStorage.setItem("savedEmail", email)
      localStorage.setItem("savedPassword", password)
      localStorage.setItem("rememberMe", "true")
    } else {
      localStorage.removeItem("savedEmail")
      localStorage.removeItem("savedPassword")
      localStorage.removeItem("rememberMe")
    }

    navigate("/app") // ✅ FIXED
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Signup"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {!isLogin && (
            <input
              type="password"
              placeholder="Re-enter Password"
              className="w-full p-2 border rounded mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {isLogin && (
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Remember Me</label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Signup"}
          </button>
        </form>

        <div
          className="text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          Switch to {isLogin ? "Signup" : "Login"}
        </div>
      </div>
    </div>
  )
}