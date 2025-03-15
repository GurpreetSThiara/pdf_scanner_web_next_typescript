"use client";

import { DefaultSeo } from "next-seo";

export default function RootSEO() {
  return (
    <DefaultSeo
      titleTemplate="%s | PDF & Image Conversion Tools"
      defaultTitle="PDF & Image Conversion Tools | Free Online Converters"
      description="Free online tools to convert, merge, split, and edit PDF files and images. Convert JPG to PDF, PDF to JPG, PNG to PDF, and more with our easy-to-use tools."
      canonical="https://yourwebsite.com/"
      openGraph={{
        type: 'website',
        locale: 'en_US',
        url: 'https://yourwebsite.com/',
        siteName: 'PDF & Image Conversion Tools',
        images: [
          {
            url: 'https://yourwebsite.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'PDF & Image Conversion Tools',
          },
        ],
      }}
      twitter={{
        handle: '@yourhandle',
        site: '@yoursite',
        cardType: 'summary_large_image',
      }}
      additionalMetaTags={[
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ]}
    />
  );
} 