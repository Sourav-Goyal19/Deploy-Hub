import { useEffect, useRef } from "react";
import { Server, Globe, Shield, Zap, GitBranch, BarChart } from "lucide-react";

const features = [
  {
    title: "Global Edge Network",
    description:
      "Deploy to our global CDN for maximum performance with automatic scaling and load balancing.",
    icon: Globe,
  },
  {
    title: "Continuous Deployment",
    description:
      "Automatically deploy when you push to Git. Preview deployments for pull requests.",
    icon: GitBranch,
  },
  {
    title: "Zero Configuration",
    description:
      "We auto-detect your framework and build settings. Just push your code and we handle the rest.",
    icon: Zap,
  },
  {
    title: "Enterprise Security",
    description:
      "Automatic HTTPS, DDoS protection, and enterprise-grade security for all deployments.",
    icon: Shield,
  },
  {
    title: "Serverless Functions",
    description:
      "Deploy backend code with serverless functions that scale automatically with your traffic.",
    icon: Server,
  },
  {
    title: "Performance Analytics",
    description:
      "Get detailed insights into your application's performance, traffic, and user engagement.",
    icon: BarChart,
  },
];

const Features = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="features" className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to deploy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools you need to deploy your web
            applications quickly and securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              //@ts-ignore
              ref={(el) => (featureRefs.current[i] = el)}
              className={`slide-in-up bg-card rounded-lg border p-6 card-hover ${
                i % 3 === 0
                  ? "slide-in-left"
                  : i % 3 === 2
                  ? "slide-in-right"
                  : "slide-in-up"
              }`}
            >
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
