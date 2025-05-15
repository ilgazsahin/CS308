const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token', error: err });
    }
  };
};

module.exports = checkRole;
