import "./globals.css";

export const metadata = {
  title: { default: "Mentiq — AI that learns how you learn", template: "%s · Mentiq" },
  description: "An adaptive exam-prep tutor that understands what you know, detects what you misunderstand, and builds your next learning step around you.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#4f46e5" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
