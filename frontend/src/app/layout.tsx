import type { Metadata } from "next";
import { Geist, Geist_Mono, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LumoLearn",
    template: "%s | LumoLearn",
  },
  description:
    "Inkluzivna obrazovna platforma posvećena deci sa posebnim potrebama — slabovidim učenicima i deci sa disleksijom.",
  applicationName: "LumoLearn",
  openGraph: {
    title: "LumoLearn — Učenje bez prepreka",
    description:
      "Inkluzivna obrazovna platforma za decu sa posebnim potrebama.",
    type: "website",
    locale: "sr_RS",
    siteName: "LumoLearn",
  },
  twitter: {
    card: "summary",
    title: "LumoLearn — Učenje bez prepreka",
    description:
      "Inkluzivna obrazovna platforma za decu sa posebnim potrebama.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${atkinsonHyperlegible.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
