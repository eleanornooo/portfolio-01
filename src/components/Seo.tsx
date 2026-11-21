import { Head } from 'vite-react-ssg';
import { useLang } from '../i18n/useLang';
import og from '../lib/og.json';

export const SITE_URL = 'https://www.mimoudi.com';

/** Which share image a page uses (see src/lib/og.json and `npm run og`). */
export type OgImage = keyof typeof og.images;

/**
 * Per-page <head>: title, description, canonical URL, Open Graph and Twitter card.
 * Pages are pre-rendered in English, so link previews (WhatsApp, LinkedIn…) show the English
 * image; the French one is swapped in when the visitor switches the site to French.
 */
export default function Seo({
  title,
  description,
  path,
  image = 'default',
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
  noindex?: boolean;
}) {
  const { lang } = useLang();
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  const img = og.images[image][lang];
  const imageUrl = `${SITE_URL}/${img.file}`;
  const alt = `${og.name[lang]} — ${og.title[lang]}. ${img.eyebrow}: ${img.line}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={url} />}
      <meta property="og:type" content={path === '/' ? 'profile' : 'website'} />
      <meta property="og:site_name" content="Aziz Mimoudi" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={alt} />
      <meta property="og:locale" content={lang === 'fr' ? 'fr_FR' : 'en_GB'} />
      <meta property="og:locale:alternate" content={lang === 'fr' ? 'en_GB' : 'fr_FR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={alt} />
    </Head>
  );
}
