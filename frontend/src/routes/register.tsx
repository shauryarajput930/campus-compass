import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";
import { Info } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Campus Compass" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-foreground">Campus Registration:</span> Sign up with your <strong className="text-foreground">Email address</strong> or Google account to get started.
          </div>
        </div>
      </div>
      <SignUp
        routing="path"
        path="/register"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "shadow-glow border border-border rounded-2xl",
          },
        }}
      />
    </div>
  );
}

