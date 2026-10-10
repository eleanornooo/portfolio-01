import type { ReactNode } from 'react';
import { profile } from '../content/profile';
import { affiliations, positions } from '../content/experience';
import { certifications, degrees } from '../content/education';
import { service } from '../content/service';
import { awards } from '../content/awards';
import { students } from '../content/students';
import { beyondAcademia } from '../content/beyond';
import { useLang } from '../i18n/useLang';
import { doiUrl } from '../lib/apa';
import Seo from '../components/Seo';
import Section, { PageHeader } from '../components/Section';
import { Ext, LinkRow } from '../components/Ext';

function Logo({ name }: { name?: string }) {
  if (!name) return <span className="hidden h-10 w-10 sm:block" aria-hidden="true" />;
  return (
    <img
      src={`/img/logos/${name}.webp`}
      width={40}
      height={40}
      alt=""
      loading="lazy"
      decoding="async"
      className="hidden h-10 w-10 shrink-0 rounded-[2px] border border-rule opacity-80 mix-blend-multiply sm:block dark:opacity-70 dark:mix-blend-normal dark:invert"
    />
  );
}

/** A row with the period in a fixed left column. */
function Row({ period, children }: { period: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-1 gap-x-6 gap-y-1 py-5 sm:grid-cols-[8.5rem_1fr]">
      <p className="num text-sm text-ink3 sm:pt-0.5">{period}</p>
      <div>{children}</div>
    </li>
  );
}

export function Component() {
  const { t, pick, lang } = useLang();
  const [lead, ...rest] = profile.bio[lang];

  return (
    <>
      <Seo title={t.about.metaTitle} description={t.about.metaDescription} path="/about" />
      <PageHeader title={t.about.title}>
        <p className="prose-measure mt-8 font-serif text-[1.375rem] font-light leading-[1.55] md:text-[1.5rem]">
          {lead}
        </p>
        {rest.map((p) => (
          <p key={p.slice(0, 24)} className="prose-measure mt-5 text-ink2">
            {p}
          </p>
        ))}
        <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-rule pt-5 text-sm">
          <h2 className="label font-sans">{t.about.identifiers}</h2>
          <Ext href={profile.links.scholar}>Google Scholar</Ext>
          <Ext href={profile.links.orcid}>ORCID 0000-0003-2219-9586</Ext>
          {profile.links.scopus && <Ext href={profile.links.scopus}>Scopus</Ext>}
          <Ext href={profile.links.linkedin}>LinkedIn</Ext>
        </div>
      </PageHeader>

      <Section id="experience" index="01" label={t.about.experience}>
        <ol className="divide-y divide-rule border-y border-rule">
          {positions.map((p) => (
            <Row key={p.id} period={p.periodLabel ?? `${p.start}–${p.end ?? t.common.present}`}>
              <div className="flex items-start gap-4">
                <Logo name={p.logo} />
                <div>
                  <h3 className="font-serif text-[1.1875rem] font-normal leading-snug">
                    {p.url ? (
                      <Ext href={p.url} className="link-quiet decoration-transparent hover:decoration-accent">
                        {p.role}
                      </Ext>
                    ) : (
                      p.role
                    )}
                  </h3>
                  <p className="mt-0.5 text-ink2">
                    {p.org}
                    {p.place && <span className="text-ink3"> · {p.place}</span>}
                  </p>
                </div>
              </div>
            </Row>
          ))}
        </ol>

        <h3 className="label mb-2 mt-14 font-sans">{t.about.affiliations}</h3>
        <ul className="divide-y divide-rule border-y border-rule">
          {affiliations.map((a) => (
            <Row key={a.name} period={a.period}>
              <p>
                <span className="font-medium">
                  {a.url ? <Ext href={a.url} className="link-quiet">{a.name}</Ext> : a.name}
                </span>{' '}
                — {a.role}
              </p>
              <p className="text-sm text-ink2">{a.org}</p>
            </Row>
          ))}
        </ul>
      </Section>

      <Section id="education" index="02" label={t.about.education}>
        <ol className="divide-y divide-rule border-y border-rule">
          {degrees
            .filter((d) => !d.minor)
            .map((d) => (
              <Row key={d.id} period={d.year}>
                <div className="flex items-start gap-4">
                  <Logo name={d.logo} />
                  <div>
                    <h3 className="font-serif text-[1.1875rem] font-normal leading-snug">{d.degree}</h3>
                    <p className="mt-0.5 text-ink2">
                      {d.school}
                      {d.place && <span className="text-ink3"> · {d.place}</span>}
                    </p>
                    {d.thesis && (
                      <div className="prose-measure mt-3 border-l-2 border-rule pl-4 text-sm">
                        <p className="label mb-1">{t.about.thesis}</p>
                        <p lang="fr" className="font-serif text-base italic">
                          {d.thesis.title}
                        </p>
                        {d.thesis.translation && <p className="mt-1 text-ink3">{d.thesis.translation}</p>}
                        {d.thesis.doi && (
                          <p className="mt-2">
                            <Ext href={doiUrl(d.thesis.doi)} className="link num">
                              DOI {d.thesis.doi}
                            </Ext>
                          </p>
                        )}
                      </div>
                    )}
                    {d.links && <LinkRow links={d.links} className="mt-2" />}
                  </div>
                </div>
              </Row>
            ))}
          {degrees
            .filter((d) => d.minor)
            .map((d) => (
              <Row key={d.id} period={d.year}>
                <p className="text-sm text-ink2 sm:pl-14">
                  {d.degree} — {d.school}
                  {d.place && `, ${d.place}`}
                </p>
              </Row>
            ))}
        </ol>
      </Section>

      <Section id="supervision" index="03" label={t.about.supervision} intro={t.about.supervisionIntro}>
        <ol className="divide-y divide-rule border-y border-rule">
          {students.map((s) => (
            <Row key={s.name} period={`${t.about.cohort} ${s.cohort}`}>
              <h3 className="font-serif text-[1.1875rem] font-normal">{s.name}</h3>
              <p className="prose-measure mt-0.5 text-ink2">{s.topic}</p>
              <p className="mt-0.5 text-sm text-ink3">{s.status}</p>
            </Row>
          ))}
        </ol>
      </Section>

      <Section id="service" index="04" label={t.about.service}>
        <div className="space-y-14">
          {service.map((g) => (
            <div key={g.id}>
              <h3 className="label mb-2 font-sans">{pick(g.title)}</h3>
              <ul className="divide-y divide-rule border-y border-rule">
                {g.items.map((s) => (
                  <Row key={s.body} period={s.period ?? ''}>
                    <p>
                      <span className="font-medium">{s.role}</span>, {s.body}
                    </p>
                    {s.detail && <p className="prose-measure mt-1 text-sm text-ink2">{s.detail}</p>}
                    {s.links && <LinkRow links={s.links} className="mt-2" />}
                  </Row>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="awards" index="05" label={t.about.awards}>
        <ul className="divide-y divide-rule border-y border-rule">
          {awards.map((a) => (
            <Row key={a.title} period={a.year ?? ''}>
              <h3 className="font-serif text-[1.1875rem] font-normal leading-snug">{a.title}</h3>
              {a.detail && <p className="prose-measure mt-1 text-ink2">{a.detail}</p>}
              {a.links && <LinkRow links={a.links} className="mt-2" />}
            </Row>
          ))}
        </ul>
      </Section>

      <Section id="development" index="06" label={t.about.certifications}>
        <ul className="divide-y divide-rule border-y border-rule">
          {certifications.map((c) => (
            <Row key={c.title} period={c.year ?? ''}>
              <p>
                <span className="font-medium">{c.title}</span> — {c.provider}
              </p>
              {c.detail && <p className="prose-measure mt-1 text-sm text-ink2">{c.detail}</p>}
              {c.modules && (
                <ul className="mt-2 space-y-1 text-sm text-ink2">
                  {c.modules.map((m) => (
                    <li key={m.title} className="flex flex-wrap gap-x-3">
                      <span>— {m.title}</span>
                      {m.link && <LinkRow links={[m.link]} />}
                    </li>
                  ))}
                </ul>
              )}
              {c.links && <LinkRow links={c.links} className="mt-2" />}
            </Row>
          ))}
        </ul>
      </Section>

      <Section id="beyond" index="07" label={t.about.beyond}>
        <ul className="prose-measure space-y-3">
          {beyondAcademia.map((b) => (
            <li key={b.en} className="flex gap-4">
              <span className="mt-[0.7rem] h-px w-5 shrink-0 bg-vivid" aria-hidden="true" />
              <span>{pick(b)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
