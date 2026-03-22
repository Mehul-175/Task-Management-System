import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
};

export default authMiddleware;
