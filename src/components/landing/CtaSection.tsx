import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";

export function CtaSection() {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onClick = async () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch {
      // toast handled by provider log
    }
  };

  return (
    <section id="cta" className="brut-section bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-12 lg:col-span-8">
            <span className="inline-flex items-center gap-1 border-[2px] border-background bg-foreground px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-background">
              ● ready when you are
            </span>
            <h2 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              Generate your <span className="bg-neon px-2 text-foreground">ProofLink.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-background/70 md:text-lg">
              Sign in with Google, connect your GitHub, hit generate. Your public profile
              is live in under a minute.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="brut bg-background p-6 text-foreground" style={{ boxShadow: "8px 8px 0 0 var(--color-neon)" }}>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                free during beta
              </div>
              <div className="stat-num mt-2 text-5xl">$0</div>
              <ul className="mt-4 space-y-1 font-mono text-xs">
                <li>→ Public profile URL</li>
                <li>→ AI capability summary</li>
                <li>→ GitHub + resume sync</li>
              </ul>
              <button
                type="button"
                onClick={onClick}
                className="brut brut-hover brut-press mt-6 inline-flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-background"
              >
                {isAuthenticated ? "Open dashboard" : "Login with Google"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
