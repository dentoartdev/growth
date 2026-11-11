import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SideNav, TabBar } from "@/components/Nav";
import RegisterSW from "@/components/RegisterSW";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Growth · Dento Art",
  description: "Instagram coach for @dentoart.dubai",
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Growth", statusBarStyle: "black-translucent" },
  icons: { icon: `${BASE}/icon-192.png`, apple: `${BASE}/apple-touch-icon.png` },
};

export const viewport: Viewport = { themeColor: "#13161D", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <SideNav />
          <main className="main">{children}</main>
        </div>
        <TabBar />
        <RegisterSW />
      </body>
    </html>
  );
}
