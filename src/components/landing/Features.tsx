import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const items = [
  {
    tag: "01",
    title: "AI Capability Analysis",
    body: "Gemini reads your repos and writes a recruiter-ready summary, with strengths and concrete suggestions.",
    accent: "bg-electric",
  },
  {
    tag: "02",
    title: "GitHub Integration",
    body: "Live commit activity, top languages and pinned projects — pulled straight from the source of truth.",
    accent: "bg-neon",
  },
  {
    tag: "03",
    title: "Consistency Score",
    body: "A single, honest number that captures how often and how deeply you ship — across weeks, not days.",
    accent: "bg-grape",
  },
  {
    tag: "04",
    title: "Shareable Profile",
    body: "One URL. /profile/you. No login wall. Looks the same whether a recruiter opens it on desktop or phone.",
    accent: "bg-card",
  },
];

export function Features() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".feat-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "expo.out",
            delay: (i % 4) * 0.05,
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={root} className="brut-section bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="chip mb-4 bg-grape">// what you get</span>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Proof, not pitch.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Four blocks. Zero fluff. Every feature exists because a recruiter
            asked for it, not because it looked good in a slide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <article key={it.tag} className={`feat-card brut brut-hover ${it.accent} p-6`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest">{it.tag}</span>
                <span className="block h-3 w-3 border-[2px] border-foreground bg-background" />
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">
                {it.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed">{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
