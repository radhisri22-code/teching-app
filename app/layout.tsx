import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Teching — Learn Without Limits",
  description:
    "India's leading online learning platform. Access 500+ courses in tech, design, and business. Learn from industry experts at your own pace.",
  keywords: ["online learning", "courses", "education", "tech courses", "upskilling"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
