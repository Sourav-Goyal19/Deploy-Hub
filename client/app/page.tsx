import Features from "@/components/features";
import Footer from "@/components/footer";
import Frameworks from "@/components/frameworks";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Pricing from "@/components/pricing";
import Process from "@/components/process";
import Testimonials from "@/components/testimonials";

export default function Home() {
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
