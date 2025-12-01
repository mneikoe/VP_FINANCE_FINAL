const jwt = require("jsonwebtoken");

// ✅ Allowed roles (sab roles yaha rakh do)
const allowedRoles = ["HR", "OA", "OE", "Telecaller", "Telemarketer"];

const roleAuth = (req, res, next) => {
  try {
    // Header me token aana chahiye
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // ✅ Role check
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied: Unauthorized role" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = roleAuth;
