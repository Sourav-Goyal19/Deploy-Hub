import { ArrowRight } from "lucide-react";
import Button from "./button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative pt-28 pb-20 px-4 md:px-6 lg:px-8 md:pt-28 md:pb-28 overflow-hidden">
      <div className="hero-gradient"></div>

      <div className="blur-glow blur-glow-purple absolute top-32 left-[20%]"></div>
      <div className="blur-glow blur-glow-blue absolute bottom-20 right-[30%]"></div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent text-sm font-medium fade-in">
            Launching your apps has never been easier
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 fade-in fade-in-delay-1">
            Deploy your code with <span className="text-glow">one click</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto fade-in fade-in-delay-2">
            The fastest way to deploy your web applications. Push your code, we
            handle the rest. Zero configuration, global CDN, and automatic
            HTTPS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in fade-in-delay-3">
            <Link href="/sign-in">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                Start Deploying Free
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>
        </div>

        <div className="mt-12 md:mt-16 max-w-2xl mx-auto fade-in fade-in-delay-3 rounded-lg overflow-hidden border shadow-md">
          <div className="bg-accent/50 backdrop-blur-sm px-4 py-2 border-b flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-xs text-muted-foreground">Terminal</div>
          </div>
          <div className="bg-black text-white p-4 font-mono text-sm">
            <p className="opacity-70">$ deploywave init</p>
            <p className="text-green-400 mt-1">
              ✓ Project initialized successfully!
            </p>
            <p className="opacity-70 mt-2">$ git push deploywave main</p>
            <p className="opacity-70 mt-1">Deploying...</p>
            <p className="text-green-400 mt-1">✓ Build completed</p>
            <p className="text-green-400">
              ✓ Deployed to https://my-app.deploywave.app
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
