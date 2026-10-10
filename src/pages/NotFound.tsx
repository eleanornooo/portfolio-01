import { Link } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import { PageHeader } from '../components/Section';

export function Component() {
  const { t } = useLang();
  return (
    <>
      <Seo title={`${t.notFound.title} — Aziz Mimoudi`} description={t.notFound.body} path="/404" noindex />
      <PageHeader title={t.notFound.title} intro={t.notFound.body}>
        <p className="mt-10">
          <Link to="/" className="btn-solid">
            {t.notFound.home}
          </Link>
        </p>
      </PageHeader>
      <div className="h-24" />
    </>
  );
}
