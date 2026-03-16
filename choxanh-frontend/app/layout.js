import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import HeaderWrapper from "../components/HeaderWrapper";
import AiChatWidget from "../components/AiChatWidget";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            <HeaderWrapper />
            {children}
            <AiChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}