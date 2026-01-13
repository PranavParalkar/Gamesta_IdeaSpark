import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from 'react-hot-toast';
import AppChrome from "@/components/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gamesta — Ideas Platform",
  description: "Collect, vote and showcase college fest ideas. Join the community of innovators.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
       
      >
        <ThemeProvider>
          <AppChrome>{children}</AppChrome>

          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 3500,
              style: { background: 'rgba(0,0,0,0.85)', color: '#fff', borderRadius: 10 },
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
