const prisma = require('../config/db');

class ItemRepository {
  async create(inventoryId, data) {
    return await prisma.item.create({
      data: {
        ...data,
        inventoryId: parseInt(inventoryId),
      },
      include: {
        tags: true,
        likes: true,
      }
    });
  }

  async findAll(filters = {}) {
    return await prisma.item.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        likes: true,
      }
    });
  }

  async findById(id) {
    return await prisma.item.findUnique({
      where: { id: parseInt(id) },
      include: {
        tags: true,
        likes: true,
        inventory: {
            select: { id: true, title: true, authorId: true }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.item.update({
      where: { id: parseInt(id) },
      data: data,
      include: {
        tags: true,
        likes: true, 
      }
    });
  }

  async updateWithVersion(id, currentVersion, data) {
    return await prisma.item.update({
      where: { 
        id: parseInt(id),
        version: parseInt(currentVersion)
      },
      data: {
        ...data,
        version: { increment: 1 }
      },
      include: {
        tags: true,
        likes: true, 
      }
    });
  }

  async delete(id) {
    return await prisma.item.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new ItemRepository();
