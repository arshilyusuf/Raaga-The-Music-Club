type LoginScreenProps = {
  email: string
  password: string
  loading: boolean
  error: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
}

export function LoginScreen({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-xl w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">Raaga - Admin Login</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none"
        />
        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-lg py-3 font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  )
}