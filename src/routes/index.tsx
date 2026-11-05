import { createFileRoute } from '@tanstack/react-router'

import { About } from '~/components/home/About'
import { Activity } from '~/components/home/Activity'
import { Contact } from '~/components/home/Contact'
import { Experience } from '~/components/home/Experience'
import { Hero } from '~/components/home/Hero'
import { Projects } from '~/components/home/Projects'
import { Skills } from '~/components/home/Skills'
import { ParticleField } from '~/components/ParticleField'
import { SiteNav } from '~/components/SiteNav'
import { getActivity } from '~/functions/activity.functions'
import { getProfileView } from '~/functions/profile.functions'
import { yearOf } from '~/lib/dates'
import { homeSearchSchema } from '~/lib/search'
import { site } from '~/lib/site'
import { serializeJsonForScript, toPersonJsonLd } from '~/lib/structured-data'

export const Route = createFileRoute('/')({
  validateSearch: homeSearchSchema,
  // `?skill` only drives client-side scrolling, so it is deliberately *not* a loader dependency:
  // changing it never refetches.
  loader: async () => {
    // Not awaited: the shell renders and streams immediately, and the activity feed streams in
    // later through <Await>. Failures degrade to `null` instead of erroring the page.
    const activity = getActivity({ data: {} }).catch(() => null)
    const view = await getProfileView()
    return { view, activity }
  },
  staleTime: 5 * 60_000,
  // Full-document SSR, cached briefly at the CDN so the live feed stays fresh.
  headers: () => ({
    'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
  }),
  head: ({ loaderData }) => ({
    meta: [{ title: site.title }, { property: 'og:url', content: site.url }],
    links: [{ rel: 'canonical', href: site.url }],
    scripts: loaderData
      ? [
          {
            type: 'application/ld+json',
            children: serializeJsonForScript(toPersonJsonLd(loaderData.view.profile)),
          },
        ]
      : [],
  }),
  component: HomePage,
})

function HomePage() {
  const { view, activity } = Route.useLoaderData()
  const { skill } = Route.useSearch()
  const { profile, stats } = view
  const selectedSkill = profile.skills.some((s) => s.slug === skill) ? skill : undefined
  const linkFor = (kind: 'github' | 'gitlab') =>
    profile.links.find((link) => link.kind === kind)?.url ?? profile.url

  return (
    <div className="relative overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="backdrop-grid absolute inset-0" />
        <div className="absolute -top-1/3 left-1/2 h-[80vh] w-[90vw] -translate-x-1/2 rounded-full bg-lilac-400/10 blur-[120px]" />
      </div>
      <ParticleField className="opacity-40 min-[900px]:opacity-100" />
      <SiteNav />

      <main id="main" className="relative z-10">
        <Hero
          name={profile.name}
          headline={profile.headline}
          principles={profile.principles}
          years={stats.yearsExperience}
        />
        <About name={profile.name} summary={profile.summary} stats={stats} />
        <Experience
          experience={profile.experience}
          roleVisuals={view.roleVisuals}
          techIcons={view.techIcons}
          now={view.now}
          years={stats.yearsExperience}
        />
        <Projects
          projects={profile.projects}
          visuals={view.projectVisuals}
          techIcons={view.techIcons}
        />
        <Skills skills={profile.skills} colors={view.skillColors} selected={selectedSkill} />
        <Activity
          feed={activity}
          links={{ github: linkFor('github'), gitlab: linkFor('gitlab') }}
        />
        <Contact
          email={profile.email}
          links={profile.links}
          source={profile.source}
          year={yearOf(view.now)}
        />
      </main>
    </div>
  )
}
