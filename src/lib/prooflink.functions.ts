// Frontend wrappers for Vercel API routes
export const getMyProfile = async ({ data }: { data: { idToken: string } }) => {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: data.idToken, action: 'get' }),
  });
  return res.json();
};

export const checkUsername = async ({ data }: { data: { username: string; idToken: string } }) => {
  const res = await fetch(`/api/check-username?username=${data.username}&idToken=${data.idToken}`);
  return res.json();
};

export const saveProfile = async ({ data }: { data: any }) => {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, action: 'save' }),
  });
  return res.json();
};

export const generateProofLink = async ({ data }: { data: { idToken: string } }) => {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: data.idToken }),
  });
  return res.json();
};

export const getPublicProfile = async ({ data }: { data: { username: string } }) => {
  const res = await fetch(`/api/public-profile?username=${data.username}`);
  return res.json();
};
