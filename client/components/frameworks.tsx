const Frameworks = () => {
  const frameworks = [
    {
      name: "React",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Next.js",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Vue",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Nuxt",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Angular",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Svelte",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Express",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Node.js",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Django",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Ruby on Rails",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Laravel",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
    {
      name: "Flask",
      logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=100&auto=format&fit=crop",
    },
  ];

  return (
    <section
      id="frameworks"
      className="py-20 bg-accent/50 px-4 md:px-6 lg:px-8"
    >
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Deploy any framework
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We support all major web frameworks and technologies. Just push your
            code and we'll handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 slide-in-up">
          {frameworks.map((framework) => (
            <div
              key={framework.name}
              className="bg-background rounded-lg p-6 flex flex-col items-center justify-center card-hover border"
            >
              <div className="w-12 h-12 mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                <div className="font-bold text-sm">
                  {framework.name.charAt(0)}
                </div>
              </div>
              <span className="font-medium text-sm">{framework.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Frameworks;
