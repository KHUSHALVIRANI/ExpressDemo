import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Get the token from the header
  const token = req.headers['authorization'];


  // If no token, return 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user info to the request
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token is not valid
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
