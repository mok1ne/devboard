import type { Metadata } from "next";
import "@/styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "DevBoard — Task Manager for Developers",
  description: "A Kanban board built for engineering teams",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" data-theme="dark">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
