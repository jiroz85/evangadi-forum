// Allow production, preview deployments, and localhost
const isOriginAllowed = (origin) => {
  if (!origin || typeof origin !== 'string') return false;
  const o = origin.toLowerCase();
  return (
    o === 'https://evangadi-forum-beige.vercel.app' ||
    o === 'http://localhost:3000' ||
    o.endsWith('.vercel.app')
  );
};

const cors = (req, res, next) => {
  const origin = req.headers.origin || req.headers.Origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Fallback: allow any vercel.app for preview deployments
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

module.exports = cors;
