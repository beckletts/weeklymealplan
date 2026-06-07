interface P {
  className?: string
}
const base = (className?: string) => ({
  className,
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const Sparkles = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M11 3l1.9 4.6L17.5 9.5 12.9 11.4 11 16l-1.9-4.6L4.5 9.5l4.6-1.9z" />
    <path d="M18 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </svg>
)

export const Pot = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 9h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
    <path d="M2 9h20" />
    <path d="M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
    <path d="M9 2v2M15 2v2" />
  </svg>
)

export const Basket = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M5 11l1.5 9.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5L19 11" />
    <path d="M3 11h18M8 11l2-7M16 11l-2-7" />
  </svg>
)

export const Gear = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6 1.6 1.6 0 0 0 8 1.1V1a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 14 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.1 1.5H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

export const Plus = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Trash = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

export const Link = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
)

export const Refresh = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
)

export const Copy = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const X = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const Chevron = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

export const Heart = ({ className, filled }: P & { filled?: boolean }) => (
  <svg {...base(className)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
)
