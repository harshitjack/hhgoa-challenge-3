import React from "react";
import Hero from "../components/Hero";
import VerificationConsole from "../components/VerificationConsole";
import Architecture from "../components/Architecture";

export default function Home({ verification }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen">
      {/* 1. Hero Section */}
      <Hero
        onStartVerification={() => scrollToSection("console")}
        onViewPipeline={() => scrollToSection("pipeline")}
        previewUrl={verification.previewUrl}
      />

      {/* 2. Main Verification Console */}
      <VerificationConsole verification={verification} />

      {/* 3. Architecture Topology */}
      <Architecture />
    </main>
  );
}
