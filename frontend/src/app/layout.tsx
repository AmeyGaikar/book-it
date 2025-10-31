import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "HD Booking",
  description: "Book curated experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFA] text-[#212121]">
        <Suspense>
          <Navbar />
        </Suspense>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
