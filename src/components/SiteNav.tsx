import { Link } from '@tanstack/react-router'

import { site } from '~/lib/site'

import { BrandIcon } from './BrandIcon'

const sections = [
  { hash: 'experience', label: 'Experience' },
  { hash: 'projects', label: 'Projects' },
  { hash: 'skills', label: 'Skills' },
  { hash: 'contact', label: 'Contact' },
] as const

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3">
      <div
        aria-hidden
        className="scroll-progress absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-lilac-300 to-peach-300"
      />
      <nav
        aria-label="Primary"
        className="glass mx-auto mt-3 flex max-w-5xl items-center justify-between gap-3 rounded-full py-1.5 pr-1.5 pl-3"
      >
        <Link to="/" hash="top" className="flex items-center gap-2 font-display font-semibold">
          <BrandIcon icon="monogram" className="size-7 text-lilac-300" />
          <span className="hidden text-mist-100 sm:inline">{site.name}</span>
        </Link>
        <ul className="hidden items-center gap-1 text-sm md:flex">
          {sections.map((section) => (
            <li key={section.hash}>
              <Link
                to="/"
                hash={section.hash}
                className="rounded-full px-3 py-1.5 text-mist-300 transition hover:bg-mist-100/5 hover:text-mist-100"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            to="/resume"
            className="rounded-full px-3 py-1.5 text-mist-200 transition hover:bg-mist-100/5 hover:text-mist-100"
          >
            Résumé
          </Link>
          <a
            href="/resume.pdf"
            download={site.pdfFileName}
            className="rounded-full bg-lilac-300 px-3.5 py-1.5 font-medium text-night-950 transition hover:bg-peach-300"
          >
            PDF<span aria-hidden> ↓</span>
          </a>
        </div>
      </nav>
    </header>
  )
}
