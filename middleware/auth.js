const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expecting: Bearer <token>

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user; // { userId, roles }
    next();
  });
};

module.exports = authenticateToken;
