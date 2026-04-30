import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY);

    req.user = {
      id: decoded.id,
      system_role: decoded.system_role || decoded.role,
      company_id: decoded.company_id || decoded.company,
      company: decoded.company_id || decoded.company,
      jobrole: decoded.jobrole,
    };

    next();
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message, error: error.message });
  }
};

export default authMiddleware;
