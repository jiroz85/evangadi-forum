// Test endpoint - confirms API routes work. Remove after debugging.
module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.status(200).json({ message: "API is working", path: "/api/hello" });
};
