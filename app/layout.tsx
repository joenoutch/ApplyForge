import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyForge",
  description: "Land more interviews. Faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-[#07111f] text-white">
        {children}

        <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-400">
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/how-it-works" className="transition hover:text-white">
              How it Works
            </a>
            <a href="/disclaimer" className="transition hover:text-white">
              AI Disclaimer
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} ApplyForge. AI-generated documents should be reviewed before submission.
          </p>
        </footer>
      </body>
    </html>
  );
}