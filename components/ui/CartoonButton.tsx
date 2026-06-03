interface CartoonButtonProps {
  label: string;
  color?: string;
  hasHighlight?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function CartoonButton({
  label,
  color = 'bg-orange-400',
  hasHighlight = true,
  disabled = false,
  onClick,
}: CartoonButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <div
      className={`inline-block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <button
        disabled={disabled}
        onClick={handleClick}
        className={`relative h-12 px-6 text-xl rounded-full font-bold text-neutral-800 border-2 border-neutral-800 transition-all duration-150 overflow-hidden group
        ${color} 
        ${
          disabled
            ? 'opacity-50 pointer-events-none shadow-none'
            : 'shadow-[0_4px_0_0_#ffffff] hover:translate-y-1 hover:shadow-none active:-translate-y-1 active:shadow-[0_4px_0_0_#ffffff]'
        }`}
      >
        <span className="relative z-10 whitespace-nowrap">{label}</span>
        {hasHighlight && !disabled && (
          <div className="absolute top-1/2 -left-full w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]"></div>
        )}
      </button>
    </div>
  );
}