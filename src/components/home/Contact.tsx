import { Link } from '@tanstack/react-router'

import { BrandIcon } from '~/components/BrandIcon'
import type { Link as ProfileLink } from '~/content/schema'
import { sceneAttributes } from '~/lib/particles/engine'
import { site } from '~/lib/site'

interface ContactProps {
  email: string
  links: ProfileLink[]
  source: string
  year: number
}

export function Contact({ email, links, source, year }: ContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative px-6 pt-32 pb-12 sm:px-10 lg:px-16"
    >
      <div
        className="flex min-h-[70dvh] max-w-3xl flex-col justify-center lg:max-w-[52%]"
        {...sceneAttributes({
          shape: 'icon:email',
          color: '#ffd5ab',
          accent: '#ceabff',
          placement: 'right',
        })}
      >
        <p className="reveal font-mono text-xs tracking-[0.2em] text-peach-300 uppercase">
          06 — Contact
        </p>
        <h2
          id="contact-title"
          className="reveal mt-5 font-display text-5xl leading-[0.95] font-extrabold tracking-[-0.03em] text-mist-100 sm:text-7xl"
        >
          Let's build something <span className="text-gradient">that lasts.</span>
        </h2>
        <p className="reveal mt-6 max-w-lg text-lg text-mist-300">
          Whether it's a role, a project, or a question about something on this page, my inbox is
          open.
        </p>
        <div className="reveal mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${email}`}
            className="rounded-full bg-linear-to-r from-lilac-300 to-peach-300 px-6 py-3 font-semibold text-night-950 transition hover:brightness-110"
          >
            {email}
          </a>
          {links
            .filter((link) => link.kind !== 'email')
            .map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-mist-100/15 px-5 py-3 text-mist-100 transition hover:border-mist-100/40"
              >
                <BrandIcon icon={link.kind} className="size-4" />
                {link.label}
              </a>
            ))}
        </div>
      </div>

      <footer className="relative mt-24 flex flex-col gap-6 border-t border-mist-100/10 pt-8 text-sm text-mist-400 lg:flex-row lg:items-center lg:justify-between">
        <p>
          © {year} {site.name}. Built with TanStack Start, streamed from the server, deployed on
          Vercel.
        </p>
        <nav aria-label="Résumé formats and source" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/resume" className="hover:text-mist-100">
            Printable résumé
          </Link>
          <a href="/resume.pdf" download={site.pdfFileName} className="hover:text-mist-100">
            PDF
          </a>
          <a href="/resume.json" className="hover:text-mist-100">
            JSON Resume
          </a>
          <a href="/api/me" className="hover:text-mist-100">
            Raw JSON
          </a>
          <Link to="/lab" className="hover:text-mist-100">
            Particle lab
          </Link>
          <a href={source} target="_blank" rel="noreferrer" className="hover:text-mist-100">
            Source code
          </a>
        </nav>
      </footer>
    </section>
  )
}
