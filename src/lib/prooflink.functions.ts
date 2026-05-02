import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminAuth, adminDb } from "./firebase-admin";

const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_-]+$/, "lowercase letters, numbers, _ and - only");

async function verifyToken(idToken?: string) {
  if (!idToken) throw new Error("Unauthorized: No token provided");
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("Token verification failed", error);
    throw new Error("Unauthorized: Invalid token");
  }
}

// ---------- Public: get profile by username ----------
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((input: { username: string }) =>
    z.object({ username: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const snapshot = await adminDb
      .collection("prooflink_profiles")
      .where("username", "==", data.username)
      .limit(1)
      .get();
    
    if (snapshot.empty) return { profile: null };
    const doc = snapshot.docs[0];
    return { profile: { id: doc.id, ...doc.data() } };
  });

// ---------- Authed: get my profile ----------
export const getMyProfile = createServerFn({ method: "POST" })
  .inputValidator((input: { idToken: string }) => z.object({ idToken: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const userId = await verifyToken(data.idToken);
    const snapshot = await adminDb
      .collection("prooflink_profiles")
      .where("user_id", "==", userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return { profile: null };
    const doc = snapshot.docs[0];
    return { profile: { id: doc.id, ...doc.data() } };
  });

// ---------- Authed: check username availability ----------
export const checkUsername = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; idToken: string }) =>
    z.object({ username: z.string(), idToken: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const userId = await verifyToken(data.idToken);
    const snapshot = await adminDb
      .collection("prooflink_profiles")
      .where("username", "==", data.username)
      .limit(1)
      .get();
    
    if (snapshot.empty) return { available: true };
    const doc = snapshot.docs[0];
    return { available: doc.data().user_id === userId };
  });

// ---------- Authed: save profile ----------
const saveSchema = z.object({
  idToken: z.string(),
  username: usernameSchema,
  display_name: z.string().min(1).max(80).optional().nullable(),
  headline: z.string().max(160).optional().nullable(),
  github_handle: z.string().max(40).optional().nullable(),
  leetcode_handle: z.string().max(40).optional().nullable(),
  resume_path: z.string().max(500).optional().nullable(),
});

export const saveProfile = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof saveSchema>) => saveSchema.parse(input))
  .handler(async ({ data }) => {
    const { idToken, ...profileData } = data;
    const userId = await verifyToken(idToken);

    const clashSnapshot = await adminDb
      .collection("prooflink_profiles")
      .where("username", "==", data.username)
      .limit(1)
      .get();
    
    if (!clashSnapshot.empty && clashSnapshot.docs[0].data().user_id !== userId) {
      throw new Error("Username already taken");
    }

    const existingSnapshot = await adminDb
      .collection("prooflink_profiles")
      .where("user_id", "==", userId)
      .limit(1)
      .get();

    const payload = { ...profileData, user_id: userId, updatedAt: new Date().toISOString() };

    if (!existingSnapshot.empty) {
      const docRef = existingSnapshot.docs[0].ref;
      await docRef.update(payload);
      const updated = await docRef.get();
      return { profile: { id: updated.id, ...updated.data() } };
    }

    const docRef = await adminDb.collection("prooflink_profiles").add({
      ...payload,
      createdAt: new Date().toISOString(),
    });
    const created = await docRef.get();
    return { profile: { id: created.id, ...created.data() } };
  });

// ---------- Authed: generate ProofLink ----------
export const generateProofLink = createServerFn({ method: "POST" })
  .inputValidator((input: { idToken: string }) => z.object({ idToken: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const userId = await verifyToken(data.idToken);

    const snapshot = await adminDb
      .collection("prooflink_profiles")
      .where("user_id", "==", userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) throw new Error("Create your profile first");
    const doc = snapshot.docs[0];
    const profile = doc.data();

    if (!profile.github_handle) throw new Error("Add your GitHub handle first");

    const github = await fetchGithub(profile.github_handle);
    const leetcode = profile.leetcode_handle ? mockLeetcode(profile.leetcode_handle) : null;

    const ai = await callGemini({
      github,
      leetcode,
      handles: { github: profile.github_handle, leetcode: profile.leetcode_handle },
    });

    const generated = { ai, github, leetcode, generatedAt: new Date().toISOString() };

    await doc.ref.update({
      generated_data: generated,
      generated_at: new Date().toISOString(),
      headline: profile.headline || ai.headline,
    });

    const updated = await doc.ref.get();
    return { profile: { id: updated.id, ...updated.data() } };
  });

async function callGemini(payload: unknown) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const prompt = `You are an expert technical recruiter. Given the following developer activity data, produce a credible, structured capability profile in strict JSON.
Data: ${JSON.stringify(payload)}

Return ONLY JSON with this shape: 
{ "headline": "string", "summary": "string", "capabilityScore": number, "scoreBreakdown": { "consistency": number, "depth": number, "breadth": number }, "skills": ["string"], "strengths": ["string"], "suggestions": ["string"], "hireSignal": "string", "tags": ["string"] }`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("Gemini API Error:", errData);
    throw new Error(`Gemini API Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Clean up markdown code blocks if present
  text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("AI output was invalid JSON");
  }
}

async function fetchGithub(handle: string) {
  const userRes = await fetch(`https://api.github.com/users/${handle}`);
  if (!userRes.ok) throw new Error(`GitHub user not found: ${handle}`);
  const user = await userRes.json();
  const reposRes = await fetch(`https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`);
  const reposRaw: any[] = await reposRes.json();
  const repos = reposRaw.filter((r) => !r.fork && !r.archived).sort((a, b) => b.stargazers_count - a.stargazers_count);
  return { user, stats: { totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0), activeRepos: repos.length }, topRepos: repos.slice(0, 6) };
}

function mockLeetcode(handle: string) {
  return { handle, solved: { easy: 85, medium: 125, hard: 25 }, ranking: 15000 };
}
