import React from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { useVerification } from "./hooks/useVerification";

export default function App() {
  const verification = useVerification();

  const handleNavigate = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070709] text-[#f3f4f6] font-display antialiased overflow-x-hidden bg-grain">
      {/* Sticky Editorial Navbar */}
      <Navbar
        onRunVerification={() => handleNavigate("console")}
        onNavigate={handleNavigate}
      />

      {/* Main Content View */}
      <Home verification={verification} />

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
