type DetailProps = {
  label: string
  value?: string | null
  capitalize?: boolean
}

export function Detail({ label, value, capitalize }: DetailProps) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-white ${capitalize ? 'capitalize' : ''}`}>
        {value || <span className="text-gray-600">—</span>}
      </p>
    </div>
  )
}