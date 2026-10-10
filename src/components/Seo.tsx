import { Head } from 'vite-react-ssg';

export const SITE_URL = 'https://www.mimoudi.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Per-page <head>: title, description, canonical URL, Open Graph and Twitter card. */
export default function Seo({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
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
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Dr. Aziz Mimoudi — Assistant Professor, ISE – UM6P" />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}
