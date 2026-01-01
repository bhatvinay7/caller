"use client";

import localFont from "next/font/local";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "../lib/redux/store";
import ThemeInitializer from "../components/theme-initializer";
import {Toaster } from "chat-ui";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}>
        <Provider store={store}>
          <ThemeInitializer>
            {children}
            <Toaster/>
          </ThemeInitializer>

        </Provider>
      </body>
    </html>
  );
}
