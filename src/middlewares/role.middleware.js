const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
        if (!allowedRoles.includes(req.user.system_role)) {
          return res.status(403).json({ message: "Access denied" });
        }
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error", error})
    }
  };
};
