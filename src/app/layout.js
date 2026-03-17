import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.json";
import { CartProvider } from "./CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: config.Metadata.SEO.title,
  description: config.Metadata.SEO.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
