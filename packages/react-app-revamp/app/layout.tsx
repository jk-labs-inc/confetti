import "@getpara/react-sdk-lite/styles.css";
import LayoutBase from "@layouts/LayoutBase";
import { GoogleAnalytics } from "@next/third-parties/google";
import { polyfill } from "interweave-ssr";
import { GA_TRACKING_ID } from "lib/gtag";
import { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import "react-loading-skeleton/dist/skeleton.css";
import "react-tooltip/dist/react-tooltip.css";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";
import Providers from "./providers";

const lato = localFont({
  src: [
    {
      path: "./_fonts/Lato-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./_fonts/Lato-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./_fonts/Lato-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-family-lato",
});

const saboRegular = localFont({
  src: "../public/fonts/Sabo-Regular.otf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-family-sabo-regular",
});

const saboFilled = localFont({
  src: "./_fonts/Sabo-Filled.otf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-family-sabo-filled",
});

polyfill();

export const metadata: Metadata = {
  metadataBase: new URL("https://confetti.win"),
  title: "Confetti",
  description: "Confetti - vote. rally. earn.",
  openGraph: {
    title: "Confetti",
    description: "Confetti - vote. rally. earn.",
    type: "website",
    url: "https://confetti.win",
    locale: "en_US",
  },
  twitter: {
    description: "Confetti - vote. rally. earn.",
    title: "Confetti",
    card: "summary_large_image",
    //TODO: update this to the actual twitter handle
    site: "@jokerace_io",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const DynamicPortal = dynamic(() => import("./portal"), { ssr: !!false });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} ${saboRegular.variable} ${saboFilled.variable} antialiased`}>
      <body className={lato.className}>
        <div id="__next">
          <NextTopLoader color="#BB65FF" shadow="0 0 10px #BB65FF, 0 0 5px #78FFC6" showSpinner={false} />
          <Providers>
            <LayoutBase>{children}</LayoutBase>
            <DynamicPortal />
            <GoogleAnalytics gaId={GA_TRACKING_ID} />
          </Providers>
        </div>
      </body>
    </html>
  );
}
