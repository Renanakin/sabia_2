import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import HeaderDesktop from "@/components/desktop/HeaderDesktop";
import HeaderMobile from "@/components/mobile/HeaderMobile";
import Footer from "@/components/Footer";
import BottomNavMobile from "@/components/mobile/BottomNavMobile";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sabiacontable.cl"),
  title: "Sabia Contable | Asesoría Contable y Tributaria Premium",
  description: "Servicios de contabilidad integral, remuneraciones, gestión tributaria y auditoría para pymes y profesionales en Chile.",
  openGraph: {
    title: "Sabia Contable | Asesoría Contable Premium",
    description: "Equipo especializado en contabilidad, tributaria y proyectos. Tranquilidad financiera para enfocarte en crecer tu negocio.",
    url: "https://sabiacontable.cl",
    siteName: "Sabia Contable",
    images: [
      {
        url: "https://sabiacontable.cl/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sabia Contable Asesoría",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabia Contable | Asesoría Contable Premium",
    description: "Servicios de contabilidad integral y gestión tributaria.",
    images: ["https://sabiacontable.cl/og-image.jpg"],
  },
  keywords: ["contabilidad", "asesoría tributaria", "contadores", "Santiago", "Chile", "estudios contables"],
  authors: [{ name: "Sabia Contable" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AccountingService",
              "name": "Sabia Contable",
              "description": "Asesoría contable, tributaria y laboral premium para empresas y profesionales en Chile",
              "telephone": "+56982223173",
              "email": "contacto@sabiacontable.cl",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Gran Avenida José Miguel Carrera 5234, Oficina 402",
                "addressLocality": "San Miguel",
                "addressRegion": "Región Metropolitana",
                "addressCountry": "CL"
              },
              "url": "https://sabiacontable.cl",
              "logo": "https://sabiacontable.cl/images/logo.png",
              "openingHours": ["Mo-Fr 09:00-18:00"],
              "priceRange": "$$",
              "sameAs": [
                "https://www.linkedin.com/company/sabiacontable",
                "https://www.instagram.com/sabiacontable"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#032030] text-slate-100 selection:bg-[#d80073] selection:text-white">
        <HeaderDesktop />
        <HeaderMobile />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ScrollToTop />
        <BottomNavMobile />
      </body>
    </html>
  );
}
