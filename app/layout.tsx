import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";


const prompt = Prompt({
  weight: ["400", "700"],
  variable: "--font-prompt",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Task Management System',
  description: 'Full-stack task management application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.className} antialiased bg-gray-50`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
