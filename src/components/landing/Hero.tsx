import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";

export function Hero() {
  const root = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-line", { yPercent: 110, opacity: 0 });
      gsap.set(".hero-sub", { y: 16, opacity: 0 });
      gsap.set(".hero-cta", { y: 12, opacity: 0 });
      gsap.set(".hero-card", { opacity: 0, y: 24 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".hero-line", { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.08 })
        .to(".hero-sub", { y: 0, opacity: 1, duration: 0.6 }, "-=0.5")
        .to(".hero-cta", { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
        .to(".hero-card", { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, "-=0.5");
    }, root);
    return () => ctx.revert();
  }, []);

  const handleLogin = async () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <section ref={root} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-16 md:px-8 md:py-28">
        {/* Left: headline */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="chip bg-neon">● LIVE BETA</span>
            <span className="chip">v0.1 — pixel build</span>
          </div>

          <h1 className="font-display text-[clamp(2.75rem,7vw,6.25rem)] font-bold leading-[0.95] tracking-tight">
            <span className="block overflow-hidden">
              <span className="hero-line block">Turn your work</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block">
                into <span className="bg-electric px-2">proof.</span>
              </span>
            </span>
          </h1>

          <p className="hero-sub mt-6 max-w-xl font-sans text-base text-muted-foreground md:text-lg">
            A single link that shows what you've <em className="not-italic font-semibold text-foreground">actually</em> built.
            ProofLink aggregates your GitHub, resume and links, then lets AI write a credible,
            recruiter-ready capability report.
          </p>

          <div className="hero-cta mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="brut brut-hover brut-press inline-flex items-center gap-2 bg-foreground px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-background"
            >
              <GoogleGlyph /> {isAuthenticated ? "Dashboard" : "Get ProofLink"}
            </button>
            <a
              href="#preview"
              className="brut brut-hover brut-press inline-flex items-center gap-2 bg-background px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest"
            >
              See a sample profile →
            </a>
          </div>

          <div className="hero-cta mt-8 grid max-w-md grid-cols-3 gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <div>
              <div className="stat-num text-2xl text-foreground">3.2k</div>
              commits indexed
            </div>
            <div>
              <div className="stat-num text-2xl text-foreground">128</div>
              profiles shipped
            </div>
            <div>
              <div className="stat-num text-2xl text-foreground">∞</div>
              recruiter scans
            </div>
          </div>
        </div>

        {/* Right: stacked preview tiles */}
        <div className="col-span-12 lg:col-span-4">
          <div className="grid gap-4">
            <div className="hero-card brut bg-electric p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest">capability score</span>
                <span className="chip bg-background">A+</span>
              </div>
              <div className="stat-num mt-3 text-5xl">92</div>
              <div className="mt-1 font-mono text-xs">consistency · depth · breadth</div>
            </div>
            <div className="hero-card brut bg-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">top stack</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {["TypeScript","React","Postgres","Rust","Tailwind","Vite"].map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
            <div className="hero-card brut bg-neon p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest">last 30 days</span>
              <CommitBars />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommitBars() {
  const heights = [12, 28, 18, 40, 22, 8, 34, 30, 16, 44, 26, 10, 38, 50, 24, 14, 42, 32, 20, 46];
  return (
    <div className="mt-3 flex h-16 items-end gap-1">
      {heights.map((h, i) => (
        <span
          key={i}
          className="block w-full border-[1.5px] border-foreground bg-background"
          style={{ height: `${h * 1.4}%` }}
        />
      ))}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFC107" d="M21.8 10H12v4h5.6c-.8 2.3-3 4-5.6 4a6 6 0 1 1 0-12c1.5 0 2.9.6 3.9 1.5l2.8-2.8A10 10 0 1 0 22 12c0-.7-.1-1.3-.2-2z"/>
      <path fill="#FF3D00" d="M3.2 7.3l3.3 2.4A6 6 0 0 1 12 6c1.5 0 2.9.6 3.9 1.5l2.8-2.8A10 10 0 0 0 3.2 7.3z"/>
      <path fill="#4CAF50" d="M12 22c2.6 0 5-1 6.8-2.6l-3.1-2.6A6 6 0 0 1 6.4 14L3.1 16.5A10 10 0 0 0 12 22z"/>
      <path fill="#1976D2" d="M21.8 10H12v4h5.6a6 6 0 0 1-2 2.8l3.1 2.6A10 10 0 0 0 22 12c0-.7-.1-1.3-.2-2z"/>
    </svg>
  );
}
