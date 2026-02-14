// Allowed origins: production + any Vercel deployment (*.vercel.app)
const isOriginAllowed = (origin) => {
  if (!origin) return false;
  return (
    origin === 'https://evangadi-forum-beige.vercel.app' ||
    origin.endsWith('.vercel.app')
  );
};

const cors = (req, res, next) => {
  const origin = req.headers.origin || req.headers.Origin;
  if (origin && isOriginAllowed(origin)) {
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
