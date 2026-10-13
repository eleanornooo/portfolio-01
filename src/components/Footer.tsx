import { Link } from 'react-router-dom';
import { profile } from '../content/profile';
import { useLang } from '../i18n/useLang';
import { monthYear } from '../lib/dates';
import { Ext } from './Ext';
import { NAV } from './nav';
import { ZelligeBand } from './Zellige';

export default function Footer() {
  const { t, pick, lang } = useLang();
  const built = __BUILD_TIME__;
  const year = new Date(built).getUTCFullYear();

  return (
    <footer role="contentinfo" className="mt-8 bg-paper2/60">
      <ZelligeBand />
      <div className="page grid-12 gap-y-10 border-t border-rule py-14">
        <div className="col-span-4 md:col-span-5">
          <p className="font-serif text-h3">
            {profile.honorific} {profile.name}, {profile.postnominal}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink2">
            {pick(profile.title)} · {pick(profile.role)}, {profile.institutionShort}
          </p>
          <p className="mt-4 text-sm">
            <a className="link" href={`mailto:${profile.email.primary}`}>
              {profile.email.primary}
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-3 md:col-start-7">
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="link-quiet no-underline hover:underline">
                  {t.nav[n.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-3">
          <ul className="space-y-2 text-sm">
            <li>
              <Ext href={profile.links.scholar} className="link-quiet no-underline hover:underline">
                Google Scholar
              </Ext>
            </li>
            <li>
              <Ext href={profile.links.orcid} className="link-quiet no-underline hover:underline">
                ORCID
              </Ext>
            </li>
            <li>
              <Ext href={profile.links.linkedin} className="link-quiet no-underline hover:underline">
                LinkedIn
              </Ext>
            </li>
            {profile.links.instagram && (
              <li>
                <Ext href={profile.links.instagram} className="link-quiet no-underline hover:underline">
                  Instagram
                </Ext>
              </li>
            )}
          </ul>
        </div>

        <div className="col-span-4 flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6 text-sm text-ink3 md:col-span-12">
          <p className="num">
            © {year} {profile.name}. {t.footer.updated(monthYear(built, lang))}.
          </p>
          <a href="#top" className="link-quiet no-print">
            {t.footer.top} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
