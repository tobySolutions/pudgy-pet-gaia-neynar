import type { Metadata } from 'next';

import '~/app/globals.css';
import { Providers } from '~/app/providers';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/pudgy-image.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/pudgy-image.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: { url: '/pudgy-image.jpg', sizes: '180x180', type: 'image/jpeg' },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics/>
      </body>
    </html>
  );
}
