import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";

export function SiteHeader() {
  const { isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b-[2px] border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 grid-cols-2 grid-rows-2 border-[2px] border-foreground">
            <span className="bg-foreground" />
            <span className="bg-electric" />
            <span className="bg-neon" />
            <span className="bg-grape" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">ProofLink</span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest md:flex">
          <a href="/#features" className="hover:text-electric">Features</a>
          <a href="/#how" className="hover:text-electric">How it works</a>
          <a href="/#preview" className="hover:text-electric">Preview</a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="brut brut-hover brut-press inline-flex items-center bg-background px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="brut brut-hover brut-press inline-flex items-center bg-foreground px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-background"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  navigate({ to: "/dashboard" });
                } catch (error) {
                  console.error("Login failed:", error);
                }
              }}
              className="brut brut-hover brut-press inline-flex items-center bg-foreground px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-background"
            >
              Get ProofLink
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
