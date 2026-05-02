import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPublicProfile } from "@/lib/prooflink.functions";
import { Linkedin, Twitter, Instagram, Github, ExternalLink, Globe, Layout, Rocket, Box, Cpu, Zap, FileText, ShieldCheck, Target } from "lucide-react";

interface AiData {
  headline?: string;
  summary?: string;
  capabilityScore?: number;
  scoreBreakdown?: { consistency?: number; depth?: number; breadth?: number };
  skills?: string[];
  strengths?: string[];
  suggestions?: string[];
  hireSignal?: string;
  tags?: string[];
  versatility?: { frontend: number; backend: number; devops: number };
  careerTrajectory?: string;
  projectInsights?: { name: string; impact: string; techStack: string }[];
  socialAudit?: string;
}

interface GeneratedData {
  ai?: AiData;
  github?: {
    user?: {
      login?: string;
      name?: string;
      bio?: string | null;
      avatar_url?: string;
      followers?: number;
      following?: number;
      public_repos?: number;
      location?: string | null;
      company?: string | null;
      blog?: string | null;
      html_url?: string;
    };
    stats?: {
      totalStars?: number;
      totalForks?: number;
      activeRepos?: number;
      topLanguages?: { name: string; count: number }[];
    };
    topRepos?: {
      name: string;
      description: string | null;
      language: string | null;
      stars: number;
      forks: number;
      url: string;
    }[];
  };
  leetcode?: {
    handle: string;
    solved: { easy: number; medium: number; hard: number };
    contestRating: number;
    ranking: number;
    badges: string[];
  } | null;
  generatedAt?: string;
}

interface PublicProfile {
  username: string;
  display_name: string | null;
  email: string | null;
  headline: string | null;
  live_url: string | null;
  github_handle: string | null;
  linkedin_handle: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  leetcode_handle: string | null;
  resume_path: string | null;
  generated_data: GeneratedData | null;
  generated_at: string | null;
}

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const { profile } = await getPublicProfile({ data: { username: params.username } });
    if (!profile) throw notFound();
    return { profile: profile as PublicProfile };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    const name = p?.display_name || p?.username || "ProofLink";
    const desc =
      p?.generated_data?.ai?.summary?.slice(0, 155) ||
      p?.headline ||
      "A ProofLink developer profile.";
    return {
      meta: [
        { title: `${name} — ProofLink` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — ProofLink` },
        { property: "og:description", content: desc },
        ...(p?.generated_data?.github?.user?.avatar_url
          ? [{ property: "og:image", content: p.generated_data.github.user.avatar_url }]
          : []),
      ],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="brut bg-card p-8 text-center">
        <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: PublicProfilePage,
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="brut bg-card p-10 text-center">
        <span className="chip bg-electric">404</span>
        <h1 className="mt-4 font-display text-4xl font-bold">No ProofLink here.</h1>
        <p className="mt-2 text-muted-foreground">This username isn't claimed yet.</p>
        <Link to="/" className="brut brut-hover brut-press mt-6 inline-flex items-center bg-foreground px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-background">
          Claim your link →
        </Link>
      </div>
    </div>
  );
}

function PublicProfilePage() {
  const data = Route.useLoaderData() as { profile: PublicProfile };
  const profile = data.profile;
  const [copied, setCopied] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const ai = profile.generated_data?.ai;
  const gh = profile.generated_data?.github;
  const lc = profile.generated_data?.leetcode;

  useEffect(() => {
    if (profile.resume_path) {
      setResumeUrl(profile.resume_path);
    }
  }, [profile.resume_path]);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedLiveUrl = profile.live_url ? (profile.live_url.startsWith('http') ? profile.live_url : `https://${profile.live_url}`) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ProofLink" className="h-7 w-7 border-[2px] border-foreground object-contain bg-white" />
            <span className="font-display text-base font-bold">ProofLink</span>
          </Link>
          <button
            type="button"
            onClick={copy}
            className="brut brut-hover brut-press inline-flex items-center bg-background px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest"
          >
            {copied ? "Copied ✓" : "Share ⧉"}
          </button>
        </div>

        <div className="brut bg-card">
          {/* Header */}
          <header className="flex flex-col items-start justify-between gap-4 border-b-[2px] border-foreground p-6 md:flex-row md:items-center md:p-8">
            <div className="flex items-center gap-4">
              {gh?.user?.avatar_url ? (
                <img
                  src={gh.user.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="h-16 w-16 border-[2px] border-foreground bg-foreground object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 grid-cols-2 grid-rows-2 border-[2px] border-foreground">
                  <span className="bg-foreground" />
                  <span className="bg-electric" />
                  <span className="bg-grape" />
                  <span className="bg-neon" />
                </div>
              )}
              <div>
                <h1 className="font-display text-3xl font-bold leading-none md:text-4xl">
                  {profile.display_name || profile.username}
                </h1>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {profile.headline || ai?.headline || `@${profile.username}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.email && (
                <a className="chip bg-electric text-background border-none hover:bg-neon transition-all hover:scale-105 active:scale-95" href={`mailto:${profile.email}`}>
                  HIRE ME ⚡
                </a>
              )}
              {profile.github_handle && (
                <a className="chip" href={`https://github.com/${profile.github_handle}`} target="_blank" rel="noreferrer">
                  github/{profile.github_handle}
                </a>
              )}
              {profile.leetcode_handle && (
                <a className="chip" href={`https://leetcode.com/${profile.leetcode_handle}`} target="_blank" rel="noreferrer">
                  leetcode/{profile.leetcode_handle}
                </a>
              )}
              {resumeUrl && (
                <a className="chip bg-neon" href={resumeUrl} target="_blank" rel="noreferrer">
                  resume.pdf
                </a>
              )}
            </div>
          </header>

          {!ai ? (
            <div className="p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              This ProofLink hasn't been generated yet.
            </div>
          ) : (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 border-b-[2px] border-foreground md:grid-cols-4">
                <Stat label="Capability" value={ai.capabilityScore ?? "—"} accent />
                <Stat label="Public repos" value={gh?.user?.public_repos ?? "—"} />
                <Stat label="Total stars" value={gh?.stats?.totalStars ?? "—"} />
                <Stat
                  label="Hire signal"
                  value={(ai.hireSignal ?? "—").toString().toUpperCase()}
                  small
                />
              </div>

              {/* Versatility + Career Trajectory */}
              {(ai.versatility || ai.careerTrajectory) && (
                <div className="grid grid-cols-12 border-b-[2px] border-foreground bg-foreground/5">
                  <div className="col-span-12 p-6 md:col-span-7 md:border-r-[2px] md:border-foreground md:p-8">
                    <span className="chip bg-neon">Career Trajectory</span>
                    <p className="mt-3 font-display text-lg font-bold italic md:text-xl">
                      "{ai.careerTrajectory || "On a high-growth engineering path."}"
                    </p>
                  </div>
                  <div className="col-span-12 p-6 md:col-span-5 md:p-8">
                    <span className="chip bg-electric">Versatility Matrix</span>
                    <div className="mt-4 space-y-3">
                      <Versatility label="Frontend" value={ai.versatility?.frontend ?? 0} />
                      <Versatility label="Backend" value={ai.versatility?.backend ?? 0} />
                      <Versatility label="DevOps" value={ai.versatility?.devops ?? 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary + skills */}
              <div className="grid grid-cols-12 border-b-[2px] border-foreground">
                <div className="col-span-12 border-foreground p-6 md:col-span-8 md:border-r-[2px] md:p-8">
                  <span className="chip bg-grape">Technical Audit</span>
                  <p className="mt-4 text-sm leading-relaxed md:text-base">{ai.summary}</p>

                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <BulletBox label="Strengths" items={ai.strengths ?? []} />
                    <BulletBox label="Technical Growth" items={ai.suggestions ?? []} />
                  </div>
                </div>

                <div className="col-span-12 p-6 md:col-span-4 md:p-8">
                  <span className="chip">Tech Stack</span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(ai.skills ?? []).map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>

                  {gh?.stats?.topLanguages && gh.stats.topLanguages.length > 0 && (
                    <>
                      <span className="chip mt-6">Language Proficiency</span>
                      <div className="mt-4 space-y-2">
                        {gh.stats.topLanguages.slice(0, 6).map((l) => (
                          <div key={l.name} className="flex items-center gap-3">
                            <span className="w-24 font-mono text-xs">{l.name}</span>
                            <span className="h-2 flex-1 border-[1.5px] border-foreground">
                              <span
                                className="block h-full bg-electric"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (l.count / (gh.stats?.topLanguages?.[0]?.count || 1)) * 100,
                                  )}%`,
                                }}
                              />
                            </span>
                            <span className="w-8 text-right font-mono text-xs">{l.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Technical Impact Matrix */}
              <div className="grid grid-cols-1 border-b-[2px] border-foreground md:grid-cols-4 bg-foreground text-background">
                <ImpactStat label="Architecture Depth" value={`${gh?.stats?.topLanguages?.length || 0} Layers`} desc="Multi-stack proficiency" />
                <ImpactStat label="Engineering Velocity" value={`${gh?.stats?.activeRepos || 0} Modules`} desc="Total active codebase" />
                <ImpactStat label="Community Influence" value={`${gh?.stats?.totalStars || 0} Stars`} desc="Public proof of work" />
                <ImpactStat label="Deployment Surface" value={`${profile.live_url ? '1 Live' : '0 Live'}`} desc="Production visibility" />
              </div>

              {/* Engineering Case Studies (Practical & High Impact) */}
              {ai.projectInsights && ai.projectInsights.length > 0 && (
                <div className="border-b-[2px] border-foreground p-6 md:p-10 bg-paper">
                  <div className="mb-10 text-center">
                    <span className="chip bg-foreground text-background">Practical Engineering Dossier</span>
                    <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">Technical Case Studies</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Deep analysis of production-grade contributions</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {ai.projectInsights.map((proj, i) => (
                      <div key={i} className="brut bg-background overflow-hidden group">
                        <div className="border-b-[2px] border-foreground bg-foreground p-3 text-background flex items-center justify-between">
                          <span className="font-mono text-[9px] uppercase font-bold tracking-widest">Case Study #{i + 1}</span>
                          <FileText size={12} />
                        </div>
                        <div className="p-5">
                          <h4 className="font-display text-xl font-bold mb-3 group-hover:text-electric transition-colors">{proj.name}</h4>

                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={12} className="text-neon" />
                                <span className="font-mono text-[8px] uppercase font-bold text-muted-foreground tracking-widest">The Core Impact</span>
                              </div>
                              <p className="text-xs leading-relaxed italic border-l-[2px] border-neon/30 pl-3 py-1">
                                {proj.impact}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Zap size={12} className="text-electric" />
                                <span className="font-mono text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Stack Architecture</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pl-5">
                                {proj.techStack.split(',').map((t, ti) => (
                                  <span key={ti} className="font-mono text-[9px] uppercase bg-foreground/5 px-1.5 py-0.5 border-[1px] border-foreground/10">{t.trim()}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border-t-[1.5px] border-foreground/10 p-3 bg-foreground/5 flex justify-between items-center">
                          <span className="font-mono text-[8px] uppercase text-muted-foreground tracking-tighter">Status: Verified Codebase</span>
                          <Target size={12} className="opacity-30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview (The Peek) */}
              {formattedLiveUrl && (
                <div className="border-b-[2px] border-foreground bg-background p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="chip bg-neon">Live Project Preview</span>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase hidden md:inline">● Interactive Frame</span>
                    </div>
                    <a
                      href={formattedLiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="brut brut-hover brut-press flex items-center gap-2 bg-foreground px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-background"
                    >
                      Visit Deployment <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="brut overflow-hidden bg-foreground">
                    {/* Browser Top Bar */}
                    <div className="flex items-center gap-1.5 border-b-[2px] border-foreground bg-background px-4 py-2.5">
                      <div className="flex gap-1.5 mr-4">
                        <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-foreground bg-destructive" />
                        <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-foreground bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-foreground bg-emerald-500" />
                      </div>
                      <div className="flex h-6 flex-1 items-center rounded border-[1.5px] border-foreground bg-foreground/5 px-3 font-mono text-[10px] text-muted-foreground overflow-hidden">
                        <Globe size={10} className="mr-2" /> {formattedLiveUrl}
                      </div>
                    </div>
                    {/* Iframe Preview */}
                    <div className="relative aspect-video w-full bg-white group">
                      <iframe
                        src={formattedLiveUrl}
                        className="h-full w-full opacity-90 transition-opacity group-hover:opacity-100"
                        title="Live Preview"
                        loading="lazy"
                      />
                      {/* Overlay for interaction safety */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5 backdrop-blur-[0.5px] group-hover:bg-transparent transition-all pointer-events-none md:pointer-events-auto">
                        <div className="pointer-events-auto flex flex-col items-center gap-4 text-center p-6 bg-background/90 brut border-none md:hidden">
                          <Rocket size={32} className="text-electric" />
                          <p className="font-display font-bold">Best viewed on desktop</p>
                          <a href={formattedLiveUrl} target="_blank" rel="noreferrer" className="chip bg-foreground text-background">Launch App</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Hub (Creative Section) */}
              <div className="border-b-[2px] border-foreground bg-paper p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex-1">
                    <span className="chip bg-grape">Social Sentiment Audit</span>
                    <p className="mt-4 font-display text-lg text-foreground/80 leading-relaxed">
                      {ai.socialAudit || "Establishing a strong professional presence across community platforms."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:w-64">
                    <SocialCard
                      icon={<Linkedin size={18} />}
                      label="LinkedIn"
                      href={profile.linkedin_handle ? `https://linkedin.com/in/${profile.linkedin_handle}` : null}
                      color="bg-[#0077B5]"
                    />
                    <SocialCard
                      icon={<Twitter size={18} />}
                      label="X / Twitter"
                      href={profile.twitter_handle ? `https://x.com/${profile.twitter_handle}` : null}
                      color="bg-foreground"
                    />
                    <SocialCard
                      icon={<Instagram size={18} />}
                      label="Instagram"
                      href={profile.instagram_handle ? `https://instagram.com/${profile.instagram_handle}` : null}
                      color="bg-[#E4405F]"
                    />
                    <SocialCard
                      icon={<Github size={18} />}
                      label="GitHub"
                      href={profile.github_handle ? `https://github.com/${profile.github_handle}` : null}
                      color="bg-[#333]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>
            {profile.generated_at
              ? `Generated ${new Date(profile.generated_at).toLocaleDateString()}`
              : "Not yet generated"}
          </span>
          <Link to="/" className="hover:text-foreground">
            Build yours →
          </Link>
        </footer>
      </div>
    </main>
  );
}

function SocialCard({ icon, label, href, color }: { icon: React.ReactNode; label: string; href: string | null; color: string }) {
  if (!href) return (
    <div className="brut opacity-30 grayscale p-3 flex flex-col items-center justify-center gap-2 aspect-square text-center text-muted-foreground">
      <div className="mb-1">{icon}</div>
      <span className="font-mono text-[8px] uppercase tracking-tighter">{label}</span>
    </div>
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`brut brut-hover brut-press p-3 flex flex-col items-center justify-center gap-2 aspect-square text-center bg-white transition-transform`}
    >
      <div className={`p-1.5 rounded-full text-white ${color}`}>{icon}</div>
      <span className="font-mono text-[8px] uppercase tracking-tighter font-bold">{label}</span>
    </a>
  );
}

function Versatility({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest mb-1 text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 border-[1.5px] border-foreground bg-background">
        <span className="block h-full bg-foreground" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`p-6 ${accent ? "bg-electric" : ""} not-last:border-r-[2px] border-foreground`}>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={`stat-num mt-2 ${small ? "text-2xl" : "text-4xl"}`}>{value}</div>
    </div>
  );
}

function BulletBox({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="brut p-4 bg-background">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3 border-b-[1px] border-foreground/10 pb-1">
        {label}
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-electric">→</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImpactStat({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="p-6 border-foreground/20 not-last:md:border-r-[2px] transition-colors hover:bg-background hover:text-foreground group">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 mb-2">{label}</div>
      <div className="font-display text-2xl font-bold mb-1">{value}</div>
      <div className="font-mono text-[8px] uppercase tracking-wider opacity-50">{desc}</div>
    </div>
  );
}
