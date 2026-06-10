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

        <footer className="text-center text-sm text-gray-400 mt-10">
		  Built by{" "}
		  <a 
			href="https://osenixtech.com"
			className="underline"
		  >
			Osenix Technologies
		  </a>

		  <br />

		  AI Engineering • SaaS Development • Business Automation
		</footer>
      </body>
    </html>
  );
}