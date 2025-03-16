import { useEffect, useRef } from "react";
import Button from "./button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Hobby",
    price: "Free",
    description: "Perfect for personal projects and experiments.",
    features: [
      "Unlimited personal projects",
      "Global CDN",
      "Automatic HTTPS",
      "Continuous deployment",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals and growing teams.",
    features: [
      "Everything in Hobby, plus:",
      "Unlimited team members",
      "Custom domains",
      "Password protection",
      "Advanced analytics",
      "Priority support",
      "Unlimited commercial projects",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs.",
    features: [
      "Everything in Pro, plus:",
      "Dedicated infrastructure",
      "SSO authentication",
      "Enterprise SLA",
      "Compliance certifications",
      "Dedicated account manager",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  const planRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    planRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      planRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="pricing" className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. No hidden fees, no
            surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              //@ts-ignore
              ref={(el) => (planRefs.current[i] = el)}
              className={`slide-in-up ${
                i === 0 ? "slide-in-left" : i === 2 ? "slide-in-right" : ""
              }`}
            >
              <div
                className={`bg-card rounded-lg border h-full flex flex-col p-6 card-hover ${
                  plan.highlighted && "border-primary shadow-lg relative"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full justify-center"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
