type HeaderBarProps = {
  onLogout: () => void
}

export function HeaderBar({ onLogout }: HeaderBarProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl sm:text-3xl mt-6 font-bold">
        Audition Registrations
      </h1>
      <button
        onClick={onLogout}
        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition"
      >
        Logout
      </button>
    </div>
  )
}