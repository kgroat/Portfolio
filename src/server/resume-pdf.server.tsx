import { Document, Link, Page, renderToBuffer, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { ResumeModel, ResumeProject, ResumeRole } from '~/lib/resume'
import type { PaperSize } from '~/lib/search'

/**
 * The résumé PDF, rendered from the same `ResumeModel` as the HTML résumé.
 *
 * Generated with react-pdf rather than a headless browser: no Chromium in the build or the
 * function bundle, real selectable text that ATS parsers can read, and a layout tuned for paper
 * instead of a print stylesheet bolted onto the website.
 */

const ink = '#0f172a'
const muted = '#475569'
const accent = '#0e7490'
const rule = '#cbd5e1'

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 46,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.38,
    color: ink,
  },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 24, letterSpacing: -0.4, lineHeight: 1.1 },
  headline: { fontSize: 11.5, color: accent, marginTop: 2 },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, fontSize: 8.5, color: muted },
  contact: { flexDirection: 'row' },
  contactLink: { color: muted, textDecoration: 'none' },
  separator: { marginHorizontal: 7, color: rule },
  summary: { marginTop: 12, fontSize: 9.8, lineHeight: 1.5 },
  section: { marginTop: 13 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: accent,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: rule,
    marginBottom: 8,
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  company: { fontFamily: 'Helvetica-Bold', fontSize: 11.5 },
  dates: { fontSize: 8.5, color: muted },
  job: { marginBottom: 8 },
  role: { marginTop: 5, paddingLeft: 9, borderLeftWidth: 1.5, borderLeftColor: '#a5f3fc' },
  roleTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9.8 },
  tech: { marginTop: 2, fontSize: 7.8, color: muted },
  project: { marginBottom: 7 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  projectName: { fontFamily: 'Helvetica-Bold', fontSize: 10.2 },
  projectLink: { fontSize: 8.5, color: accent, textDecoration: 'none' },
  badge: { fontFamily: 'Helvetica-Oblique', fontSize: 8.5, color: muted },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillCategory: { width: 128, fontFamily: 'Helvetica-Bold', fontSize: 8.8 },
  skillNames: { flex: 1, fontSize: 8.8 },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 46,
    right: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: muted,
  },
})

const techLine = (technologies: readonly string[]) => technologies.join('  ·  ')

function Role({ role }: { role: ResumeRole }) {
  return (
    <View style={styles.role} wrap={false}>
      <Text style={styles.roleTitle}>{role.title}</Text>
      <Text>{role.summary}</Text>
      <Text style={styles.tech}>{techLine(role.technologies)}</Text>
    </View>
  )
}

function Project({ project }: { project: ResumeProject }) {
  return (
    <View style={styles.project} wrap={false}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>
          {project.name}
          {project.inProgress ? <Text style={styles.badge}> (in progress)</Text> : null}
        </Text>
        {project.url && project.displayUrl ? (
          <Link src={project.url} style={styles.projectLink}>
            {project.displayUrl}
          </Link>
        ) : null}
      </View>
      <Text>{project.summary}</Text>
      <Text style={styles.tech}>{techLine(project.technologies)}</Text>
    </View>
  )
}

export function ResumeDocument({ resume, paper }: { resume: ResumeModel; paper: PaperSize }) {
  const website = resume.contacts.find((contact) => contact.label === 'Website')

  return (
    <Document
      title={`${resume.name} — Résumé`}
      author={resume.name}
      subject={resume.headline}
      keywords={resume.skills.flatMap((group) => group.names).join(', ')}
      creator={website?.display ?? resume.name}
      producer={website?.display ?? resume.name}
      language="en-US"
    >
      <Page size={paper === 'a4' ? 'A4' : 'LETTER'} style={styles.page}>
        <View>
          <Text style={styles.name}>{resume.name}</Text>
          <Text style={styles.headline}>{resume.headline}</Text>
          <View style={styles.contacts}>
            {resume.contacts.map((contact, index) => (
              <View key={contact.url} style={styles.contact}>
                {index > 0 ? <Text style={styles.separator}>|</Text> : null}
                <Link src={contact.url} style={styles.contactLink}>
                  {contact.display}
                </Link>
              </View>
            ))}
          </View>
          <Text style={styles.summary}>{resume.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience.map((job) => (
            <View key={job.company} style={styles.job}>
              <View style={styles.jobHeader} minPresenceAhead={60}>
                <Text style={styles.company}>{job.company}</Text>
                <Text style={styles.dates}>
                  {job.dates} · {job.duration}
                </Text>
              </View>
              {job.roles.map((role) => (
                <Role key={role.title} role={role} />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={80}>
            Projects
          </Text>
          {resume.projects.map((project) => (
            <Project key={project.name} project={project} />
          ))}
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {resume.skills.map((group) => (
            <View key={group.category} style={styles.skillRow}>
              <Text style={styles.skillCategory}>{group.category}</Text>
              <Text style={styles.skillNames}>{group.names.join(', ')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>{resume.name} — Résumé</Text>
          <Text>{website?.display}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function renderResumePdf(
  resume: ResumeModel,
  paper: PaperSize,
): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = await renderToBuffer(<ResumeDocument resume={resume} paper={paper} />)
  // Copy into a plain ArrayBuffer-backed view, which is what `Response` accepts.
  const bytes = new Uint8Array(buffer.byteLength)
  bytes.set(buffer)
  return bytes
}
