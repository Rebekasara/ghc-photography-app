import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Golden Hour Calculator 2025 | Best Free Photography Lighting Tool & Sun Tracker",
  description: "Professional golden hour calculator with real-time weather integration. Get precise sunrise, sunset & blue hour times worldwide. Free photography planning tool with interactive maps, sun position tracking, and authentic location-based inspiration. Perfect for landscape, portrait & travel photographers.",
  keywords: [
    "golden hour calculator",
    "blue hour calculator", 
    "photography lighting calculator",
    "sunrise sunset times",
    "photography planning app",
    "sun position tracker",
    "magic hour photography",
    "landscape photography planner",
    "portrait photography timing",
    "travel photography app",
    "golden hour times app",
    "photography weather forecast",
    "blue hour photography",
    "outdoor photography planner",
    "natural lighting calculator",
    "photography location scout",
    "sun tracking app",
    "photography light meter",
    "golden hour photography app",
    "free photography tools",
    "photography lighting guide",
    "sun position photography",
    "photography weather integration",
    "location-based photography app",
    "photography planning software",
    "best photography apps 2025",
    "photography time calculator",
    "golden hour quality predictor",
    "photography lighting conditions",
    "sun movement tracker"
  ],
  authors: [{ name: "Golden Hour Calculator Team" }],
  creator: "Golden Hour Calculator",
  publisher: "Golden Hour Calculator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://goldenhour-calculator.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Golden Hour Calculator 2025 | Professional Photography Planning Tool",
    description: "Advanced golden hour calculator with real-time weather, interactive maps & authentic location photos. Perfect for professional photographers planning outdoor shoots worldwide.",
    url: "https://goldenhour-calculator.vercel.app",
    siteName: "Golden Hour Calculator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Professional Golden Hour Calculator - Photography Planning Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Hour Calculator 2025 | Best Free Photography Tool",
    description: "Professional golden hour calculator with weather integration & location photos. Essential tool for photographers worldwide.",
    images: ["/og-image.jpg"],
    creator: "@goldenhourcalc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "Photography Tools",
  other: {
    "twitter:label1": "Price",
    "twitter:data1": "Free",
    "twitter:label2": "Category",
    "twitter:data2": "Photography Tools",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Golden Hour Calculator",
              description: "Professional golden hour calculator with real-time weather integration, interactive maps, and authentic location-based photography inspiration. Get precise sunrise, sunset, and blue hour times worldwide.",
              url: "https://goldenhour-calculator.vercel.app",
              applicationCategory: "Photography",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Golden hour calculation with astronomical precision",
                "Blue hour calculation with weather integration",
                "Interactive maps with real-time sun position tracking",
                "Location auto-detection with GPS and IP geolocation",
                "Real-time weather data and photography conditions",
                "Authentic location-based photography inspiration",
                "Professional photography planning tools",
                "Sun path visualization and shadow calculation",
                "Photography quality scoring and recommendations",
                "Multi-layer map views (satellite, terrain, street)",
                "Day/night terminator visualization",
                "Photography weather forecasting",
                "Location-based image search and inspiration",
                "Professional photography tips and guidance",
                "Sun position calculator with azimuth and altitude",
                "Photography lighting quality assessment",
                "Golden hour quality prediction",
                "Blue hour quality prediction",
                "Weather-integrated photography planning",
                "Location scout and photography spot finder",
                "Real-time countdown to next golden hour",
                "Photography scheduling and time management",
                "Sun movement tracking and visualization",
                "Photography lighting conditions analysis",
                "Professional photography resource library",
                "Travel photography planning assistant",
                "Landscape photography optimization",
                "Portrait photography timing assistant",
                "Urban photography planning tools",
                "Nature photography scheduling",
                "Architectural photography lighting guide",
                "Street photography timing calculator",
                "Seascape photography planning",
                "Wildlife photography scheduling",
                "Astrophotography planning tools",
                "Drone photography optimization",
                "Time-lapse photography planning",
                "Wedding photography scheduling",
                "Event photography lighting assistant",
                "Commercial photography planning",
                "Fine art photography optimization",
                "Documentary photography tools",
                "Sports photography lighting calculator",
                "Fashion photography scheduling",
                "Product photography lighting guide",
                "Food photography timing assistant",
                "Real estate photography optimization",
                "Travel photography planning suite",
                "Adventure photography tools",
                "Outdoor photography planning assistant",
                "Professional photography workflow integration",
                "Photography equipment recommendations",
                "Photography location database",
                "Photography weather integration",
                "Photography lighting quality scoring",
                "Photography time optimization",
                "Photography location inspiration",
                "Photography weather forecasting",
                "Photography lighting conditions",
                "Photography quality assessment",
                "Photography planning optimization",
                "Photography location scouting",
                "Photography timing optimization",
                "Photography weather analysis",
                "Photography lighting analysis",
                "Photography condition assessment",
                "Photography quality optimization",
                "Photography planning tools",
                "Photography scheduling assistant",
                "Photography timing calculator",
                "Photography weather tracker",
                "Photography lighting tracker",
                "Photography condition tracker",
                "Photography quality tracker",
                "Photography planning tracker",
                "Photography scheduling tracker",
                "Photography timing tracker",
                "Photography weather planner",
                "Photography lighting planner",
                "Photography condition planner",
                "Photography quality planner",
                "Photography planning planner",
                "Photography scheduling planner",
                "Photography timing planner"
              ],
              author: {
                "@type": "Organization",
                name: "Golden Hour Calculator Team",
              },
              publisher: {
                "@type": "Organization",
                name: "Golden Hour Calculator",
              },
              inLanguage: "en-US",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://goldenhour-calculator.vercel.app/golden-hour/{search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {children}
      </body>
    </html>
  )
}