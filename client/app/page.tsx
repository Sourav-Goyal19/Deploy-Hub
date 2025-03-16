import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Frameworks from "@/components/frameworks";
import Process from "@/components/process";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";

const Index = () => {
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
