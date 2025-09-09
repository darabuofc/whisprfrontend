import "../styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Whispr",
  description: "Underground events. Apply, get accepted, and vibe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Navbar />
        <main className="container px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
