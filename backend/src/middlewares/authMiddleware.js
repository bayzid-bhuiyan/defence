const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const freshUser = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!freshUser) {
        return req.logout((err) => {
          if (req.session) req.session.destroy();
          res.clearCookie('connect.sid');
          return res.status(401).json({ message: 'User no longer exists.' });
        });
      }
      if (freshUser.isBlocked) {
        return req.logout((err) => {
          if (err) console.error('Error logging out blocked user:', err);
          if (req.session) {
            req.session.destroy();
          }
          res.clearCookie('connect.sid'); 
          
          return res.status(403).json({ message: 'USER_BLOCKED' });
        });
      }

      req.user = freshUser;
      return next();
      
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  }
  
  res.status(401).json({ message: 'Authentication required. Please log in.' });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
};