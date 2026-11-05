import type { Profile } from '~/content/schema'

import { absoluteUrl } from './site'

/** schema.org `Person` JSON-LD for search engines and link unfurlers. */
export function toPersonJsonLd(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: profile.url,
    email: `mailto:${profile.email}`,
    jobTitle: profile.headline,
    description: profile.summary,
    image: absoluteUrl('/avatar.jpg'),
    sameAs: profile.links.filter((link) => link.kind !== 'email').map((link) => link.url),
    knowsAbout: profile.skills.map((skill) => skill.name),
  }
}

/** Serializes JSON for a `<script>` tag, escaping `<` so data can't close the tag early. */
export function serializeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}
