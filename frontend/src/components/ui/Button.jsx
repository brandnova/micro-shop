import { forwardRef } from 'react'

const variants = {
  primary:   'accent-bg text-white hover:opacity-90 active:scale-[0.98] accent-shadow',
  secondary: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98]',
  ghost:     'text-zinc-600 hover:bg-zinc-100 active:scale-[0.98]',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
  outline:   'border border-current accent-text hover:accent-light-bg active:scale-[0.98]',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-150 cursor-pointer select-none
      disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
      ${variants[variant]} ${sizes[size]} ${className}
    `}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    )}
    {children}
  </button>
))

Button.displayName = 'Button'
export default Button