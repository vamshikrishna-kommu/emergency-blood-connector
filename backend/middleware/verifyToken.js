// ============================================================
// middleware/verifyToken.js — JWT Authentication Middleware
// ============================================================
// This middleware factory protects routes by:
//   1. Checking that a JWT cookie exists
//   2. Verifying the JWT signature using the SECRET_KEY
//   3. Checking that the user's role is in the allowed list
//
// Usage example:
//   router.get("/profile", verifyToken("DONOR"), handler)
//   router.get("/admin",   verifyToken("ADMIN"), handler)
//   router.get("/shared",  verifyToken("DONOR", "RECEIVER", "ADMIN"), handler)
//
// On success: req.user is populated with the JWT payload.
// On failure: responds with 401 (no token / expired) or 403 (wrong role).

import jwt from "jsonwebtoken";

/**
 * Returns an Express middleware that validates the JWT cookie
 * and ensures the user has one of the allowed roles.
 *
 * @param {...string} allowedRoles - One or more roles permitted to access the route.
 * @returns {function} Express middleware function
 */
export const verifyToken = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // The JWT is stored in an HTTP-only cookie named "token"
      const token = req.cookies?.token;

      if (!token) {
        return res.status(401).json({ message: "Please login first." });
      }

      // Verify the token — throws if expired or tampered with
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Role-based access control: reject if role not in allowed list
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied. You don't have permission for this action." });
      }

      // Attach decoded payload to request so route handlers can use it
      req.user = decoded;
      next();
    } catch (err) {
      // jwt.verify throws JsonWebTokenError or TokenExpiredError
      res.status(401).json({ message: "Invalid or expired session. Please login again." });
    }
  };
};
