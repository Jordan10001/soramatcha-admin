import type { Metadata } from "next";
import localFont from 'next/font/local'
import { ThemeProvider } from "next-themes";
import { ErrorNotificationProvider } from "@/contexts/error-notification";
import { SupabaseAuthWatcher } from "@/components/supabase-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Soramatcha Admin",
  description: "Admin dashboard for Soramatcha",
};

const garet = localFont({
  src: [
    { path: '../assets/fonts/Garet-Book.ttf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/Garet-Heavy.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-garet',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={garet.variable} suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorNotificationProvider>
            <SupabaseAuthWatcher>
              {children}
            </SupabaseAuthWatcher>
          </ErrorNotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
