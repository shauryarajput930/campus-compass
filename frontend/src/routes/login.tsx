import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { checkIsAdmin } from "@/lib/auth-context";
import { Info } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Campus Compass" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || "";
      const isAdmin = checkIsAdmin(user.publicMetadata?.role, email);
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect");
      const requestedPath = redirectParam || "";
      const requestedAdminPath = requestedPath.startsWith("/admin");
      const nextPath = isAdmin
        ? (requestedAdminPath ? requestedPath : "/admin/dashboard")
        : (requestedAdminPath ? "/dashboard" : requestedPath || "/dashboard");
      navigate({ to: nextPath, replace: true });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-foreground">Campus Sign In:</span> Use your <strong className="text-foreground">Email address</strong> or Google account to access your Campus Compass dashboard.
          </div>
        </div>
      </div>
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
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

