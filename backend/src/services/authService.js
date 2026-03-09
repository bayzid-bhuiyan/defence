const userRepository = require('../repositories/userRepository');
const prisma = require('../config/db'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class AuthService {
  async handleOAuthLogin(profile) {
    let user = await userRepository.findByProviderId(profile.id);

    if (!user) {
      const randomPlainPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPlainPassword, 10);
      const userData = {
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id, 
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        password: hashedPassword 
      };
      
      user = await userRepository.createUser(userData);
    }

    if (user.isBlocked) {
      throw new Error('Access Denied: Your account has been blocked by an administrator.');
    }

    return user;
  }

  async handleFacebookLogin(profile) {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    
    if (!email) {
      throw new Error("Facebook did not return an email address. Please ensure your Facebook account has an email attached.");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { email },
          data: { facebookId: profile.id }
        });
      }
    } else {
      const randomPlainPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPlainPassword, 10);
      const newUserData = {
        facebookId: profile.id,
        email: email,
        name: profile.displayName || 'Facebook User',
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        isAdmin: false,
        isBlocked: false,
        password: hashedPassword 
      };
      
      user = await prisma.user.create({ data: newUserData });
    }
    if (user.isBlocked) {
      throw new Error('Access Denied: Your account has been blocked by an administrator.');
    }

    return user;
  }
}

module.exports = new AuthService();