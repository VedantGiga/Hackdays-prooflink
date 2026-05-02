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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username missing' });

  try {
    const snapshot = await db.collection('prooflink_profiles').where('username', '==', username).limit(1).get();
    if (snapshot.empty) return res.status(200).json({ profile: null });
    const doc = snapshot.docs[0];
    return res.status(200).json({ profile: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
