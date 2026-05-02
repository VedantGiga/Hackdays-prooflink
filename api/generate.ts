import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { idToken } = req.body;
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const snapshot = await db.collection('prooflink_profiles').where('user_id', '==', userId).limit(1).get();
    if (snapshot.empty) return res.status(400).json({ error: 'No profile' });
    const doc = snapshot.docs[0];
    const profile = doc.data();

    if (!profile.github_handle) return res.status(400).json({ error: 'No GitHub' });

    // GitHub Fetch
    const github = await fetchGithub(profile.github_handle);
    const ai = await callGemini({ github, handles: { github: profile.github_handle } });

    const generated = { ai, github, generatedAt: new Date().toISOString() };
    await doc.ref.update({
      generated_data: generated,
      generated_at: new Date().toISOString(),
      headline: profile.headline || ai.headline,
    });

    return res.status(200).json({ profile: { ...profile, ...generated } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async function fetchGithub(handle: string) {
  const userRes = await fetch(`https://api.github.com/users/${handle}`);
  const user = await userRes.json();
  const reposRes = await fetch(`https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`);
  const repos: any[] = await reposRes.json();
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  return { user, stats: { totalStars, activeRepos: repos.length }, topRepos: repos.slice(0, 6) };
}

async function callGemini(payload: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Dev data: ${JSON.stringify(payload)}. Return JSON capability profile.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}
