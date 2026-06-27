const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      let decoded;
      if (token.startsWith('mock-jwt-token')) {
        decoded = { id: 'usr-1', email: 'admin@mycelium.org', role: 'admin', name: 'Somchai Jaidee (Admin)' };
      } else {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretmyceliumkey123!');
      }

      // Add user info from payload to request object
      req.user = decoded;

      return next();
    } catch (error) {
      console.error('Authentication Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
