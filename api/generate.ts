import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const firebase = initAdmin();
  const db = firebase.firestore();
  const auth = firebase.auth();

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
    const ai = await callBestAvailableGemini({ 
      github, 
      handles: { 
        github: profile.github_handle,
        linkedin: profile.linkedin_handle,
        twitter: profile.twitter_handle,
        instagram: profile.instagram_handle
      } 
    });

    const generated = { ai, github, generatedAt: new Date().toISOString() };
    await doc.ref.update({
      generated_data: generated,
      generated_at: new Date().toISOString(),
      headline: profile.headline || ai.headline,
    });

    return res.status(200).json({ profile: { ...profile, ...generated } });
  } catch (error: any) {
    console.error('Generation Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function fetchGithub(handle: string) {
  const userRes = await fetch(`https://api.github.com/users/${handle}`);
  if (!userRes.ok) throw new Error(`GitHub User Fetch Failed: ${userRes.statusText}`);
  const user = await userRes.json();
  
  const reposRes = await fetch(`https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`);
  if (!reposRes.ok) throw new Error(`GitHub Repos Fetch Failed: ${reposRes.statusText}`);
  const repos: any[] = await reposRes.json();
  
  if (!Array.isArray(repos)) throw new Error("GitHub returned invalid repository data");

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  return { user, stats: { totalStars, activeRepos: repos.length }, topRepos: repos.slice(0, 6) };
}

async function callBestAvailableGemini(payload: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key missing on server");

  // Step 1: Discover available models
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const listRes = await fetch(listUrl);
  const listData = await listRes.json();
  
  const availableModels = listData.models || [];
  const bestModel = availableModels.find((m: any) => 
    m.supportedGenerationMethods.includes("generateContent") && 
    (m.name.includes("flash") || m.name.includes("pro"))
  );

  if (!bestModel) {
    throw new Error(`No generation-capable models found in your account. Found: ${availableModels.map((m:any)=>m.name).join(', ')}`);
  }

  const modelName = bestModel.name; // e.g. "models/gemini-pro"
  console.log(`Using discovered model: ${modelName}`);

  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(generateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ 
        parts: [{ 
          text: `You are a Senior Technical Architect and Head of Recruitment. 
          Perform a deep audit of this developer's work: ${JSON.stringify(payload)}.
          
          Return a comprehensive JSON profile with these fields:
          - headline: High-impact professional title.
          - summary: 2 paragraphs of deep technical analysis.
          - capabilityScore: 0-100.
          - skills: Top 8 technical skills.
          - strengths: 3 professional strengths.
          - suggestions: 3 technical growth steps.
          - hireSignal: TOP, HIGH, or MEDIUM.
          - versatility: { frontend: 0-100, backend: 0-100, devops: 0-100 } based on repo languages.
          - careerTrajectory: A 1-sentence prediction of their next 2 years.
          - projectInsights: An array of 3 objects { name, impact, techStack } for the best projects.
          - architectureGraph: { nodes: Array<{id, label, type: 'project'|'language'|'concept'}>, links: Array<{source, target, rel}> } representing their technical ecosystem.
          - socialAudit: A 1-sentence analysis of their community presence based on the provided social handles (LinkedIn, X, IG).
          
          Return ONLY raw JSON.` 
        }] 
      }] 
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gemini Error (${res.status}): ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI failed to generate content.");

  const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}
