import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Shared Map</title>
        <meta name="description" content="View shared map" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
