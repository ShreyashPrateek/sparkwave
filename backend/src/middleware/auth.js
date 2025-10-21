import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log('🔐 Auth header:', authHeader);
  
  const token = authHeader?.split(" ")[1];
  console.log('🎫 Token:', token ? 'Present' : 'Missing');
  
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('✅ Token verified for user:', verified.id);
    req.user = verified;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
