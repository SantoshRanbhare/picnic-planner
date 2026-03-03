import { useState } from "react"
import { supabase } from "./supabase"
import { useNavigate } from "react-router-dom"

export default function Auth() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password) =>
    password.length >= 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!validateEmail(email)) {
      setError("Invalid email format")
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Name is required")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
    }

    let response

    if (isLogin) {
      response = await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } else {
      response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
    }

    if (response.error) {
      setError(response.error.message)
    } else {
      if (isLogin) {
        navigate("/dashboard")
      } else {
        setSuccess("Signup successful! You can login now.")
      }
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError("Enter valid email to reset password")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Password reset email sent!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
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
            <div
              className="text-sm text-blue-500 cursor-pointer mb-4"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </div>
          )}

          {error && (
            <div className="text-red-500 mb-2 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 mb-2 text-sm">{success}</div>
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
          onClick={() => {
            setIsLogin(!isLogin)
            setError("")
            setSuccess("")
          }}
        >
          Switch to {isLogin ? "Signup" : "Login"}
        </div>
      </div>
    </div>
  )
}