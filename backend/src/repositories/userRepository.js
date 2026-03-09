const prisma = require('../config/db');

class UserRepository {
  async findByProviderId(providerId) {
    return await prisma.user.findUnique({
      where: { googleId: providerId }, 
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }
}

module.exports = new UserRepository();