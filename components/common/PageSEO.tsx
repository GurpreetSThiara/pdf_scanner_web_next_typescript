"use client";

//import { NextSeo, ArticleJsonLd } from 'next-seo';
import { usePathname } from 'next/navigation';

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  isArticle?: boolean;
  articleData?: {
    datePublished: string;
    dateModified: string;
    authorName: string;
  };
}

const PageSEO = ({
  title,
  description,
  canonical,
  keywords,
  ogImage = 'https://yourwebsite.com/og-image.jpg',
  isArticle = false,
  articleData,
}: PageSEOProps) => {
  const pathname = usePathname();
  const url = canonical || `https://yourwebsite.com${pathname}`;
  
  return (
    <>
      {/* <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          title,
          description,
          url,
          type: isArticle ? 'article' : 'website',
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }}
        additionalMetaTags={[
          keywords ? {
            name: 'keywords',
            content: keywords,
          } : {},
        ].filter(tag => Object.keys(tag).length > 0)}
      />
      
      {isArticle && articleData && (
        <ArticleJsonLd
          url={url}
          title={title}
          images={[ogImage]}
          datePublished={articleData.datePublished}
          dateModified={articleData.dateModified}
          authorName={articleData.authorName}
          description={description}
          publisherName="PDF Tools"
          publisherLogo="https://yourwebsite.com/logo.png"
        />
      )} */}
    </>
  );
};

export default PageSEO; 