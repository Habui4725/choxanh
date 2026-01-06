import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import HeaderWrapper from "../components/HeaderWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            <HeaderWrapper />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}