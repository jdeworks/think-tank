interface BadgeProps {
  value: number
  size?: 'sm' | 'md'
}

export function Badge({ value, size = 'sm' }: BadgeProps) {
  const color =
    value >= 80
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : value >= 40
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : value > 0
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <span className={`rounded-full font-semibold tabular-nums ${color} ${sizeClass}`}>
      {value}%
    </span>
  )
}
