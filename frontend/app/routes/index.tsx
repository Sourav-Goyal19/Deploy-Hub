import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Frameworks from "@/components/home/frameworks";
import Header from "@/components/home/header";
import Hero from "@/components/home/hero";
import Pricing from "@/components/home/pricing";
import Process from "@/components/home/process";
import Testimonials from "@/components/home/testimonials";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
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
}
