import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ProofLink" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full brut bg-card p-8">
          <div className="mb-6 grid h-10 w-10 grid-cols-2 grid-rows-2 border-[2px] border-foreground">
            <span className="bg-foreground" />
            <span className="bg-electric" />
            <span className="bg-neon" />
            <span className="bg-grape" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight">
            Sign in to <span className="bg-electric px-1">ProofLink</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            One link. Real capability. Continue with Google to claim your handle.
          </p>

          <button
            type="button"
            onClick={async () => {
              try {
                await signInWithGoogle();
                // State might take a beat to update, but we can navigate now
                navigate({ to: "/dashboard" });
              } catch (error) {
                console.error("Login Error:", error);
              }
            }}
            className="brut brut-hover brut-press mt-6 inline-flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-background"
          >
            <GoogleGlyph /> Continue with Google
          </button>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            By continuing you agree to our terms. Public profile, your data, your link.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFC107" d="M21.8 10H12v4h5.6c-.8 2.3-3 4-5.6 4a6 6 0 1 1 0-12c1.5 0 2.9.6 3.9 1.5l2.8-2.8A10 10 0 1 0 22 12c0-.7-.1-1.3-.2-2z" />
      <path fill="#FF3D00" d="M3.2 7.3l3.3 2.4A6 6 0 0 1 12 6c1.5 0 2.9.6 3.9 1.5l2.8-2.8A10 10 0 0 0 3.2 7.3z" />
      <path fill="#4CAF50" d="M12 22c2.6 0 5-1 6.8-2.6l-3.1-2.6A6 6 0 0 1 6.4 14L3.1 16.5A10 10 0 0 0 12 22z" />
      <path fill="#1976D2" d="M21.8 10H12v4h5.6a6 6 0 0 1-2 2.8l3.1 2.6A10 10 0 0 0 22 12c0-.7-.1-1.3-.2-2z" />
    </svg>
  );
}
