import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout() {
  return (
    <>
      <Header />

      {/* FIX: scroll to top khi đổi trang */}
      <ScrollToTop />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
