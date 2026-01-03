import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google'; // <--- Bổ sung dòng này
// GLOBAL
import "./assets/css/main.css";

// VENDOR CSS
import "./assets/vendor/bootstrap/css/bootstrap.min.css";
import "./assets/vendor/bootstrap-icons/bootstrap-icons.css";
import "./assets/vendor/aos/aos.css";
import "./assets/vendor/swiper/swiper-bundle.min.css";

// VENDOR JS

import "bootstrap/dist/js/bootstrap.bundle.min.js";


// AOS (bản module chuẩn)
import AOS from "aos";
import "aos/dist/aos.css";
import ScrollToTop from "./components/ScrollToTop.jsx";
import 'bootstrap-icons/font/bootstrap-icons.css';

// KHỞI TẠO AOS
AOS.init();

const GOOGLE_CLIENT_ID = "157798484606-80019p9sjblufdsr7r7bh2lu14mn91ct.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ScrollToTop />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
    </AuthProvider>
  </BrowserRouter>
);
