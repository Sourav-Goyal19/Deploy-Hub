"use client";
import { useEffect } from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Frameworks from "@/components/frameworks";
import Process from "@/components/process";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";

const Index = () => {
  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const section = document.querySelector(hash);
        if (section) {
          setTimeout(() => {
            section.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);

    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.hash &&
        anchor.hash.startsWith("#") &&
        anchor.pathname === window.location.pathname
      ) {
        e.preventDefault();
        window.history.pushState(null, "", anchor.hash);
        const section = document.querySelector(anchor.hash);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("click", handleNavClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleNavClick);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />
      <main>
        <Hero />
        <Features />
        <Frameworks />
        <Process />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
