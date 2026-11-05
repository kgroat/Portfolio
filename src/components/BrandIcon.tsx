import { getIcon, type IconKey } from '~/content/icons'

interface BrandIconProps {
  icon: IconKey
  className?: string
  /** Accessible name. Omit for decorative icons. */
  title?: string
}

export function BrandIcon({ icon, className, title }: BrandIconProps) {
  const data = getIcon(icon)
  return (
    <svg
      viewBox={`0 0 ${data.size} ${data.size}`}
      className={className}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={data.path} fillRule={data.fillRule} />
    </svg>
  )
}
