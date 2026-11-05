import type { IconKey } from '~/content/icons'

import { BrandIcon } from './BrandIcon'

export function TechChip({ name, icon }: { name: string; icon?: IconKey }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-mist-100/10 bg-night-800/70 px-2.5 py-1 font-mono text-[0.72rem] text-mist-300">
      {icon ? <BrandIcon icon={icon} className="size-3.5 opacity-80" /> : null}
      {name}
    </li>
  )
}
