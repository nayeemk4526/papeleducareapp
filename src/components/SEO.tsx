import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SITE_NAME = "Papel Edu-Care";

const SEO = ({ title, description, keywords, ogImage, canonical }: SEOProps) => {
  const fullTitle = title === "হোম" ? `${SITE_NAME} - শিক্ষার নতুন দিগন্ত` : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
};

export default SEO;
