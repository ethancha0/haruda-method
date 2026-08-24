import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import { ChartProvider } from "@/components/ChartProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haruda Method",
  description:
    "Track one long-term goal through eight themes and sixty-four weekly actions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col text-ink">
        <ChartProvider>
          <AppNav />
          <main className="flex-1 w-full">{children}</main>
        </ChartProvider>
      </body>
    </html>
  );
}
