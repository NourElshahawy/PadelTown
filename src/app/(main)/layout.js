import "@/styles/all.css";
import { ToastProvider } from "@/components/shared/ToastProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Urbanist, Plus_Jakarta_Sans } from "next/font/google";
import WhatsAppFloatButton from "@/components/shared/WhatsAppFloatButton";
import LoginPromptModal from "@/components/shared/LoginPromptModal";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});
export default function MainLayout({ children }) {
  return (
    <ToastProvider>
      <Navbar />
      {children}
      <WhatsAppFloatButton />
      <Footer />
      <LoginPromptModal />
    </ToastProvider>
  );
}