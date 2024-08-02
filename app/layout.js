import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pantry Manager",
  description: "Manager for pantry items, as well as an AI recipe generator based on the items you have!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
