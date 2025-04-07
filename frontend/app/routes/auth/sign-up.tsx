import AuthForm from "@/components/auth/sign-up/auth-form";
import { Button } from "@/registry/new-york-v4/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="bg-gradient-to-b from-custom2 to-custom1 min-h-screen flex flex-col w-full items-center justify-center">
      <h1 className="text-3xl font-bold text-center text-white">
        Create Your Account
      </h1>
      <AuthForm />
      <div className="mt-8 text-center">
        <Link to="/" className="flex">
          <Button className="bg-white/5 text-amber-400/80 border border-border hover:border-border/30 hover:bg-primary/20 hover:text-amber-300 hover:opacity-80 transition duration-300 py-5 px-8 rounded-md shadow-lg">
            <ArrowLeft size={20} />
            <span className="ml-2">Back to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
