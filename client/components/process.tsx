import { useEffect, useRef } from "react";
import { GitBranch, Terminal, UploadCloud, Check } from "lucide-react";

const steps = [
  {
    title: "Connect your repository",
    description:
      "Link your GitHub, GitLab, or Bitbucket repository to DeployWave.",
    icon: GitBranch,
  },
  {
    title: "Push your code",
    description:
      "Write your code and push it to your repository as you normally would.",
    icon: Terminal,
  },
  {
    title: "We build your site",
    description:
      "DeployWave automatically builds your site using your framework's build command.",
    icon: UploadCloud,
  },
  {
    title: "Your site is live",
    description:
      "Your site is deployed to our global CDN and available at your custom domain.",
    icon: Check,
  },
];

const Process = () => {
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

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
      }
    );

    stepsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepsRef.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="process" className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Deploy your web applications in just four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              //@ts-ignore
              ref={(el) => (stepsRef.current[i] = el)}
              className="slide-in-up relative"
            >
              <div className="bg-card rounded-lg border p-6 card-hover h-full">
                <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                  {i + 1}
                </div>

                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-border z-0 transform -translate-x-6"></div>
                )}

                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 mt-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
