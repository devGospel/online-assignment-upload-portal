

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../app/lib/AuthProvider';
import { ThemeProvider } from './lib/ThemeProvider';
import Header from '../components/Header';
import { GoogleOAuthProvider } from '@react-oauth/google';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Maestro',
  description: 'A modern portal for university students to upload assignments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        {/* <ThemeProvider> */}
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
        {/* </ThemeProvider> */}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}