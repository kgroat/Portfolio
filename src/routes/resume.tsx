import { createFileRoute, Link, stripSearchParams } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { BrandIcon } from '~/components/BrandIcon'
import { getResume } from '~/functions/profile.functions'
import { cn } from '~/lib/cn'
import type { ResumeModel } from '~/lib/resume'
import { type PaperSize, paperSizes, resumeSearchSchema } from '~/lib/search'
import { absoluteUrl, site } from '~/lib/site'

const paperLabels: Record<PaperSize, string> = { letter: 'US Letter', a4: 'A4' }

/**
 * A clean, printable résumé. Fully server-rendered (no client-only pieces), and cached at the
 * CDN because it only changes when the content does.
 */
export const Route = createFileRoute('/resume')({
  validateSearch: resumeSearchSchema,
  // Keep URLs clean: `?paper=letter` is the default, so it's stripped from links.
  search: { middlewares: [stripSearchParams({ paper: 'letter' })] },
  loader: () => getResume(),
  staleTime: Infinity,
  headers: () => ({
    'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
  }),
  head: () => ({
    meta: [
      { title: `Résumé — ${site.name}` },
      { name: 'description', content: `The résumé of ${site.name}. ${site.description}` },
      { property: 'og:url', content: absoluteUrl('/resume') },
    ],
    links: [{ rel: 'canonical', href: absoluteUrl('/resume') }],
  }),
  component: ResumePage,
})

function ResumePage() {
  const resume = Route.useLoaderData()
  const { paper } = Route.useSearch()
  const pdfHref = paper === 'a4' ? '/resume.pdf?paper=a4' : '/resume.pdf'

  return (
    <div className="min-h-dvh bg-night-950 pb-16 print:bg-white print:p-0">
      <style>{`@page { size: ${paper === 'a4' ? 'A4' : 'letter'}; margin: 0.45in 0.5in; }`}</style>

      <header className="sticky top-0 z-10 border-b border-mist-100/10 bg-night-950/85 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[8.5in] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-mist-300 hover:text-mist-100"
          >
            <BrandIcon icon="monogram" className="size-6 text-lilac-300" />
            <span aria-hidden>←</span> Back to the site
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <nav aria-label="Paper size" className="flex rounded-full bg-night-800 p-0.5">
              {paperSizes.map((size) => (
                <Link
                  key={size}
                  from={Route.fullPath}
                  search={{ paper: size }}
                  replace
                  resetScroll={false}
                  aria-current={paper === size ? 'true' : undefined}
                  className={cn(
                    'rounded-full px-3 py-1 transition',
                    paper === size
                      ? 'bg-mist-100 text-night-950'
                      : 'text-mist-300 hover:text-mist-100',
                  )}
                >
                  {paperLabels[size]}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-mist-100/20 px-4 py-1.5 text-mist-100 hover:border-mist-100/50"
            >
              Print
            </button>
            <a
              href={pdfHref}
              download
              className="rounded-full bg-lilac-300 px-4 py-1.5 font-medium text-night-950 hover:bg-peach-300"
            >
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <main
        id="main"
        className={cn(
          'mx-auto mt-8 bg-white px-[0.6in] py-[0.55in] text-slate-900 shadow-2xl shadow-black/40 print:mt-0 print:w-auto print:p-0 print:shadow-none',
          paper === 'a4' ? 'w-[210mm] max-w-full' : 'w-[8.5in] max-w-full',
        )}
      >
        <ResumeSheet resume={resume} />
      </main>
    </div>
  )
}

function ResumeSheet({ resume }: { resume: ResumeModel }) {
  return (
    <article className="text-[10.5pt] leading-normal">
      <header>
        <h1 className="text-[26pt] leading-none font-bold tracking-tight">{resume.name}</h1>
        <p className="mt-1 text-[12pt] text-cyan-800">{resume.headline}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9pt] text-slate-600">
          {resume.contacts.map((contact) => (
            <li key={contact.url}>
              <a href={contact.url} className="hover:text-cyan-800">
                {contact.display}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4">{resume.summary}</p>
      </header>

      <ResumeSection title="Experience">
        {resume.experience.map((job) => (
          <section key={job.company} className="mb-4">
            <header className="flex break-after-avoid flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[12pt] font-bold">{job.company}</h3>
              <p className="text-[9pt] text-slate-600">
                {job.dates} · {job.duration}
              </p>
            </header>
            {job.roles.map((role) => (
              <div
                key={role.title}
                className="mt-2 break-inside-avoid border-l-2 border-cyan-200 pl-3"
              >
                <h4 className="font-bold">{role.title}</h4>
                <p>{role.summary}</p>
                <p className="mt-0.5 text-[8.5pt] text-slate-600">
                  {role.technologies.join(' · ')}
                </p>
              </div>
            ))}
          </section>
        ))}
      </ResumeSection>

      <ResumeSection title="Education">
        {resume.education.map((education) => (
          <section key={education.institution} className="mb-3 break-inside-avoid">
            <header className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-bold">{education.institution}</h3>
              <p className="text-[9pt] text-slate-600">{education.dates}</p>
            </header>
            <p>{education.credential}</p>
          </section>
        ))}
      </ResumeSection>

      <ResumeSection title="Projects">
        {resume.projects.map((project) => (
          <section key={project.name} className="mb-3 break-inside-avoid">
            <header className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-bold">
                {project.name}
                {project.inProgress ? (
                  <span className="font-normal text-slate-500 italic"> (in progress)</span>
                ) : null}
              </h3>
              {project.url ? (
                <a href={project.url} className="text-[9pt] text-cyan-800">
                  {project.displayUrl}
                </a>
              ) : null}
            </header>
            <p>{project.summary}</p>
            <p className="mt-0.5 text-[8.5pt] text-slate-600">{project.technologies.join(' · ')}</p>
          </section>
        ))}
      </ResumeSection>

      <ResumeSection title="Skills">
        <dl className="grid break-inside-avoid grid-cols-[10rem_1fr] gap-x-4 gap-y-1">
          {resume.skills.map((group) => (
            <div key={group.category} className="contents">
              <dt className="font-bold">{group.category}</dt>
              <dd>{group.names.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </ResumeSection>
    </article>
  )
}

function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 break-after-avoid border-b border-slate-300 pb-1 text-[9pt] font-bold tracking-[0.15em] text-cyan-800 uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}
