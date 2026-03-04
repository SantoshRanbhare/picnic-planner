import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { useNavigate } from "react-router-dom"

// Toast component
function Toast({ message, type, onClose }) {
  if (!message) return null
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white transition-opacity z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
      <span
        className="ml-2 cursor-pointer font-bold"
        onClick={onClose}
      >
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password) => password.length >= 6

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) navigate("/dashboard")
    }
    checkSession()
  }, [navigate])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: "", type }), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!validateEmail(email)) {
      showToast("Invalid email format", "error")
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters", "error")
      setLoading(false)
      return
    }

    if (!isLogin) {
      // SIGNUP FLOW
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

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (signupError) {
        if (signupError.code === "over_email_send_rate_limit") {
          showToast("Too many signup requests. Please try again later.", "error")
        } else if (signupError.message.includes("already registered")) {
          showToast("Email already exists. Please login.", "error")
        } else {
          showToast(signupError.message, "error")
        }
      } else {
        // If confirmation email was sent, treat as existing email
        if (data?.user?.confirmation_sent_at) {
          showToast("Email already exists. Please login.", "error")
        } else {
          showToast("Signup successful! You can login now.", "success")
        }
      }
    } else {
      // LOGIN FLOW
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { persistSession: rememberMe },
      })

      if (!loginError) {
        if (rememberMe) {
          localStorage.setItem("savedEmail", email)
          localStorage.setItem("savedPassword", password)
          localStorage.setItem("rememberMe", rememberMe)
        } else {
          localStorage.removeItem("savedEmail")
          localStorage.removeItem("savedPassword")
          localStorage.removeItem("rememberMe")
        }
        navigate("/dashboard")
      } else {
        showToast(loginError.message, "error")
      }
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      showToast("Enter valid email to reset password", "error")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      if (error.code === "over_email_send_rate_limit") {
        showToast("Too many password reset requests. Please try again later.", "error")
      } else {
        showToast(error.message, "error")
      }
    } else {
      showToast("Password reset email sent!", "success")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Signup"}</h2>

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
              className="absolute right-3 top-2 cursor-pointer text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {!isLogin && (
            <input
              type={showPassword ? "text" : "password"}
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
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember Me
              </label>
            </div>
          )}

          {isLogin && (
            <div
              className="text-sm text-blue-500 cursor-pointer mb-4"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <div
          className="text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => {
            setIsLogin(!isLogin)
            setToast({ message: "", type: "success" })
          }}
        >
          Switch to {isLogin ? "Signup" : "Login"}
        </div>
      </div>
    </div>
  )
}