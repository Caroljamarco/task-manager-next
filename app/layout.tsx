import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
       <nav className="flex gap-6 p-4 bg-gray-800 text-white">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/tasks" className="hover:underline">Tasks</Link>
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/health" className="hover:underline">Health</Link>
      </nav>

        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
