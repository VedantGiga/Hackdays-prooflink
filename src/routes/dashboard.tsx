import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import {
  checkUsername,
  generateProofLink,
  getMyProfile,
  saveProfile,
} from "@/lib/prooflink.functions";

type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  headline: string | null;
  github_handle: string | null;
  leetcode_handle: string | null;
  resume_path: string | null;
  generated_data: any;
  generated_at: string | null;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ProofLink" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { isAuthenticated, isLoading, user, getIdToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [github, setGithub] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoadedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadProfile = async () => {
      try {
        const token = await getIdToken();
        if (!token || token === lastLoadedTokenRef.current) return;
        lastLoadedTokenRef.current = token;
        
        setLoading(true);
        
        const { profile } = await getMyProfile({ data: { idToken: token } });
        
        if (profile) {
          setProfile(profile as Profile);
          setUsername(profile.username ?? "");
          setDisplayName(profile.display_name ?? "");
          setHeadline(profile.headline ?? "");
          setGithub(profile.github_handle ?? "");
          setLeetcode(profile.leetcode_handle ?? "");
          setResumePath(profile.resume_path ?? null);
          setResumeUrl(profile.resume_path ?? null); // Cloudinary stores the full URL
        } else if (user?.displayName) {
          setDisplayName(user.displayName);
        }
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, user, getIdToken]);

  // Username availability debounce
  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-z0-9_-]{3,32}$/.test(username)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const { available } = await checkUsername({ data: { username, idToken: token } });
        setUsernameStatus(available ? "ok" : "taken");
      } catch {
        setUsernameStatus("invalid");
      }
    }, 350);
  }, [username, getIdToken]);

  if (!isLoading && !isAuthenticated) return <Navigate to="/login" />;

  const handleResumeUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Resume must be under 8MB");
      return;
    }
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      toast.error("Cloudinary configuration missing");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", `resumes/${user.uid}`);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setResumePath(data.secure_url);
      setResumeUrl(data.secure_url);
      toast.success("Resume uploaded to Cloudinary");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSave = async () => {
    if (usernameStatus === "taken") {
      toast.error("Username already taken");
      return;
    }
    if (usernameStatus === "invalid") {
      toast.error("Invalid username");
      return;
    }
    setSaving(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Please log in again");
      const { profile: saved } = await saveProfile({
        data: {
          idToken: token,
          username,
          display_name: displayName || null,
          headline: headline || null,
          github_handle: github || null,
          leetcode_handle: leetcode || null,
          resume_path: resumePath,
        }
      });
      setProfile(saved as Profile);
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      toast.error("Save your profile first");
      return;
    }
    if (!github) {
      toast.error("Add your GitHub handle first");
      return;
    }
    setGenerating(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Please log in again");
      const { profile: updated } = await generateProofLink({ data: { idToken: token } });
      setProfile(updated as Profile);
      toast.success("ProofLink generated");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const publicUrl = profile?.username ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${profile.username}` : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="chip mb-3 bg-neon">// dashboard</span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Build your ProofLink
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Connect data, generate, share. Recruiters open one link and see real work.
            </p>
          </div>
          {publicUrl && profile?.generated_at && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied");
              }}
              className="brut brut-hover brut-press inline-flex items-center gap-2 bg-electric px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest"
            >
              {publicUrl.replace(/^https?:\/\//, "")} ⧉
            </button>
          )}
        </div>

        {loading ? (
          <div className="brut bg-card p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading…
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left: form */}
            <section className="col-span-12 lg:col-span-7">
              <div className="brut bg-card p-6 md:p-8">
                <h2 className="font-display text-xl font-bold">1. Claim your handle</h2>
                <div className="mt-4">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Username
                  </label>
                  <div className="mt-2 flex items-stretch border-[2px] border-foreground bg-background">
                    <span className="flex items-center bg-foreground px-3 font-mono text-xs text-background">prooflink/u/</span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                      placeholder="ada-lovelace"
                      className="w-full bg-transparent px-3 py-3 font-mono text-sm outline-none"
                    />
                    <span className="flex items-center px-3 font-mono text-[10px] uppercase tracking-widest">
                      {usernameStatus === "ok" && <span className="text-electric">● free</span>}
                      {usernameStatus === "taken" && <span className="text-destructive">● taken</span>}
                      {usernameStatus === "checking" && <span className="text-muted-foreground">…</span>}
                      {usernameStatus === "invalid" && <span className="text-destructive">● invalid</span>}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Display name">
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="brut-input"
                    />
                  </Field>
                  <Field label="Headline (optional)">
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Systems engineer · Open source"
                      className="brut-input"
                    />
                  </Field>
                </div>

                <h2 className="mt-10 font-display text-xl font-bold">2. Connect data</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="GitHub handle">
                    <div className="flex items-stretch border-[2px] border-foreground bg-background">
                      <span className="flex items-center bg-foreground px-3 font-mono text-xs text-background">github.com/</span>
                      <input
                        value={github}
                        onChange={(e) => setGithub(e.target.value.trim())}
                        placeholder="torvalds"
                        className="w-full bg-transparent px-3 py-3 font-mono text-sm outline-none"
                      />
                    </div>
                  </Field>
                  <Field label="LeetCode handle (optional, mocked)">
                    <div className="flex items-stretch border-[2px] border-foreground bg-background">
                      <span className="flex items-center bg-foreground px-3 font-mono text-xs text-background">leetcode/</span>
                      <input
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value.trim())}
                        placeholder="ada"
                        className="w-full bg-transparent px-3 py-3 font-mono text-sm outline-none"
                      />
                    </div>
                  </Field>
                </div>

                <div className="mt-6">
                  <Field label="Resume (PDF)">
                    <div className="flex items-center gap-3">
                      <label className="brut brut-hover brut-press inline-flex cursor-pointer items-center bg-background px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest">
                        Upload PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleResumeUpload(f);
                          }}
                        />
                      </label>
                      {resumeUrl && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs underline"
                        >
                          View current
                        </a>
                      )}
                    </div>
                  </Field>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={saving || !username}
                    onClick={handleSave}
                    className="brut brut-hover brut-press inline-flex items-center bg-foreground px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-background disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                  <button
                    type="button"
                    disabled={generating || !profile || !github}
                    onClick={handleGenerate}
                    className="brut brut-hover brut-press inline-flex items-center bg-electric px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {generating ? "Generating…" : "✨ Generate ProofLink"}
                  </button>
                  {profile?.username && (
                    <Link
                      to="/u/$username"
                      params={{ username: profile.username }}
                      className="brut brut-hover brut-press inline-flex items-center bg-background px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest"
                    >
                      View public profile →
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* Right: status */}
            <aside className="col-span-12 lg:col-span-5">
              <div className="brut bg-neon p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest">Status</span>
                <div className="mt-3 space-y-2 font-mono text-sm">
                  <Status ok={!!profile?.username}>Username claimed</Status>
                  <Status ok={!!github}>GitHub connected</Status>
                  <Status ok={!!resumePath}>Resume uploaded</Status>
                  <Status ok={!!profile?.generated_at}>AI profile generated</Status>
                </div>
              </div>

              <div className="brut mt-6 bg-card p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tips</span>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>→ Use the same username everywhere — it becomes your URL.</li>
                  <li>→ A real GitHub handle = better AI signal.</li>
                  <li>→ Re-generate any time you ship something new.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="brut brut-hover brut-press mt-6 inline-flex w-full items-center justify-center bg-background px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest"
              >
                ← Back to home
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-3 w-3 border-[2px] border-foreground ${ok ? "bg-foreground" : "bg-background"}`}
      />
      <span className={ok ? "" : "text-foreground/60"}>{children}</span>
    </div>
  );
}
