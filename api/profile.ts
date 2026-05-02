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
  const { method } = req;
  const idToken = req.body?.idToken || req.query?.idToken;

  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = await auth.verifyIdToken(idToken as string);
    const userId = decoded.uid;

    if (method === 'GET' || (method === 'POST' && req.body.action === 'get')) {
      const snapshot = await db.collection('prooflink_profiles').where('user_id', '==', userId).limit(1).get();
      if (snapshot.empty) return res.status(200).json({ profile: null });
      return res.status(200).json({ profile: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } });
    }

    if (method === 'POST' && req.body.action === 'save') {
      const { idToken, action, ...profileData } = req.body;
      
      const clashSnapshot = await db.collection('prooflink_profiles').where('username', '==', profileData.username).limit(1).get();
      if (!clashSnapshot.empty && clashSnapshot.docs[0].data().user_id !== userId) {
        return res.status(400).json({ error: 'Username taken' });
      }

      const existingSnapshot = await db.collection('prooflink_profiles').where('user_id', '==', userId).limit(1).get();
      const payload = { ...profileData, user_id: userId, updatedAt: new Date().toISOString() };

      if (!existingSnapshot.empty) {
        await existingSnapshot.docs[0].ref.update(payload);
        return res.status(200).json({ profile: payload });
      }

      const docRef = await db.collection('prooflink_profiles').add({ ...payload, createdAt: new Date().toISOString() });
      return res.status(200).json({ profile: payload });
    }

    return res.status(405).end();
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
