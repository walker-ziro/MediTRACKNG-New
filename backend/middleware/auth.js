const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header OR cookie
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
