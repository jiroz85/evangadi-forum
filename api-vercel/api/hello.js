// Test endpoint - verify API is deployed
module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  res.status(200).json({ message: "API is working", path: "/api/hello" });
};
