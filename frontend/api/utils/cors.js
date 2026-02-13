// Allowed origins: production + Vercel preview deployments
const allowedOrigins = [
  'https://evangadi-forum-beige.vercel.app',
  /^https:\/\/evangadi-forum.*\.vercel\.app$/,
];

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  return allowedOrigins.some((allowed) =>
    typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
  );
};

const cors = (req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

module.exports = cors;
