const prisma = require('../config/db'); 

class InventoryRepository {

  async create(data) {
    return await prisma.inventory.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true } 
        },
        tags: true,
      }
    });
  }

  async findAll(filters = {}, skip = 0, take = 10) {
    const whereClause = {};

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (filters.authorId) {
      whereClause.authorId = filters.authorId;
    }

    return await prisma.inventory.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' }, 
      include: {
        author: {
          select: { id: true, name: true } 
        },
        tags: true,
        _count: {
            select: { comments: true, items: true }
        }
      }
    });
  }
  async findById(id) {
    return await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
        items: true,
        comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
  async updateWithVersion(id, currentVersion, updateData) {
    return await prisma.inventory.update({
      where: { 
        id: parseInt(id),
        version: currentVersion 
      },
      data: {
        ...updateData,
        version: { increment: 1 } 
      },
      include: {
        tags: true
      }
    });
  }
  async findSharedWithUser(userId) {
    return await prisma.inventory.findMany({
      where: {
        accessList: {
          some: {
            id: parseInt(userId)
          }
        }
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: true,
        items: true
      }
    });
  }
  async search(query) {
    const formattedQuery = `${query}*`;
    return await prisma.$queryRaw`
      SELECT 
        i.id, i.title, i.description, i.category, i.createdAt, i.imageUrl,
        u.id as authorId, u.name as authorName,
        MATCH(title, description) AGAINST(${formattedQuery} IN BOOLEAN MODE) as score
      FROM Inventory i
      JOIN User u ON i.authorId = u.id
      WHERE MATCH(title, description) AGAINST(${formattedQuery} IN BOOLEAN MODE)
      ORDER BY score DESC
      LIMIT 20;
    `;
  }
  async delete(id) {
    return await prisma.inventory.delete({
        where: { id: parseInt(id) }
    });
  }
}

module.exports = new InventoryRepository();