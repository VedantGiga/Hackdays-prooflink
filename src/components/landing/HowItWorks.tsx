import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    n: "01",
    title: "Connect your accounts",
    body: "Sign in with Google, drop in your GitHub handle, paste your LinkedIn, attach a resume.",
  },
  {
    n: "02",
    title: "AI analyzes your work",
    body: "We crawl your public repos and synthesize a structured capability report with Gemini.",
  },
  {
    n: "03",
    title: "Share your ProofLink",
    body: "Get a clean public URL. Drop it in your DM, your email signature, your job application.",
  },
];

export function HowItWorks() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".step").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "expo.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={root} className="brut-section bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12">
          <span className="chip mb-4 bg-electric">// how it works</span>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            Three steps. <span className="text-muted-foreground">No CV polish.</span>
          </h2>
        </div>

        <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="step brut bg-background p-6">
              <div className="flex items-center justify-between">
                <span className="stat-num text-5xl">{s.n}</span>
                <span className="chip">step</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
