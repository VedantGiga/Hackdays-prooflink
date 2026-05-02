export function DemoPreview() {
  const skills = ["TypeScript", "React", "Next.js", "Postgres", "tRPC", "Tailwind", "Vite", "Rust", "Docker"];
  const repos = [
    { name: "ledger-engine", desc: "High-throughput double-entry ledger.", lang: "Rust", stars: 412 },
    { name: "atlas-ui", desc: "Headless components for design systems.", lang: "TypeScript", stars: 287 },
    { name: "nimbus-cron", desc: "Tiny distributed scheduler.", lang: "Go", stars: 96 },
  ];

  return (
    <section id="preview" className="brut-section bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="chip mb-4 bg-neon">// demo profile</span>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              prooflink.dev/<span className="bg-electric px-2">@ada</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            This is roughly what your public profile will look like. Boxy, scannable,
            built for someone who has 12 seconds.
          </p>
        </div>

        <div className="brut grid grid-cols-12 gap-0 bg-card">
          {/* Header row */}
          <header className="col-span-12 flex flex-col items-start justify-between gap-4 border-b-[2px] border-foreground p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 grid-cols-2 grid-rows-2 border-[2px] border-foreground">
                <span className="bg-foreground" />
                <span className="bg-electric" />
                <span className="bg-grape" />
                <span className="bg-neon" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold leading-none">Ada Lovelace</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Systems engineer · Open source · London
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip">github.com/ada</span>
              <span className="chip">linkedin/in/ada</span>
              <span className="chip bg-neon">resume.pdf</span>
            </div>
          </header>

          {/* Stats grid */}
          <div className="col-span-12 grid grid-cols-2 border-b-[2px] border-foreground md:grid-cols-4">
            {[
              { k: "Total commits", v: "3,184" },
              { k: "Active days", v: "241" },
              { k: "Problems solved", v: "612" },
              { k: "Consistency", v: "92" },
            ].map((s, i) => (
              <div
                key={s.k}
                className={`p-6 ${i < 3 ? "border-r-[2px] border-foreground" : ""} ${i === 3 ? "bg-electric" : ""}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.k}
                </div>
                <div className="stat-num mt-2 text-4xl">{s.v}</div>
              </div>
            ))}
          </div>

          {/* AI summary + skills */}
          <div className="col-span-12 grid grid-cols-12 border-b-[2px] border-foreground">
            <div className="col-span-12 border-foreground p-6 md:col-span-8 md:border-r-[2px]">
              <span className="chip bg-grape">AI Summary</span>
              <p className="mt-4 text-sm leading-relaxed md:text-base">
                Ada ships consistently across systems-level Rust and product-grade TypeScript.
                Recent work shows strong distributed-systems intuition (lock-free queues, write-ahead
                logs) plus a real product-engineering side: she owns the UI layer of two
                public design systems. <span className="bg-neon px-1">Hire signal: high.</span>
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="brut p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Strengths</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>→ Concurrency / lock-free</li>
                    <li>→ DX & API design</li>
                    <li>→ Long-horizon projects</li>
                  </ul>
                </div>
                <div className="brut p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Suggestions</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>→ Add testing write-ups</li>
                    <li>→ Pin one product repo</li>
                    <li>→ Ship a benchmark post</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-span-12 p-6 md:col-span-4">
              <span className="chip">Skills</span>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="col-span-12 p-6">
            <span className="chip mb-4 bg-electric">Top projects</span>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {repos.map((r) => (
                <article key={r.name} className="brut brut-hover bg-background p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-bold">{r.name}</h4>
                    <span className="chip">★ {r.stars}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest">{r.lang}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
