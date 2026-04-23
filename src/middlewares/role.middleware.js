const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.system_role) {
        return res.status(401).json({ message: "User identity not found" });
      }

      if (!allowedRoles.includes(req.user.system_role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }

      next(); // CRITICAL: This was missing in your code
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
};

export default roleMiddleware