import { useEffect, useRef } from "react";

const testimonials = [
  {
    quote:
      "DeployWave transformed our deployment process. We've cut our release time by 80% and our team couldn't be happier.",
    author: "Sarah Johnson",
    role: "CTO at TechStart",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80",
  },
  {
    quote:
      "The zero-configuration approach is a game-changer. We now focus on building features instead of maintaining infrastructure.",
    author: "Mark Williams",
    role: "Lead Developer at CreativeCode",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&q=80",
  },
  {
    quote:
      "Moving to DeployWave was the best decision we made this year. Our site is faster, more reliable, and we're saving money.",
    author: "Emily Chen",
    role: "Product Manager at InnovateCorp",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&auto=format&fit=crop&q=80",
  },
];

const Testimonials = () => {
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    testimonialRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      testimonialRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-accent/50 px-4 md:px-6 lg:px-8"
    >
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our customers say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't take our word for it. Here's what teams building with
            DeployWave have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.author}
              //@ts-ignore
              ref={(el) => (testimonialRefs.current[i] = el)}
              className={`slide-in-up ${
                i === 0 ? "slide-in-left" : i === 2 ? "slide-in-right" : ""
              }`}
            >
              <div className="bg-card rounded-lg border p-6 h-full flex flex-col card-hover">
                <div className="mb-4 text-4xl">"</div>
                <p className="text-muted-foreground italic mb-6 flex-grow">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
