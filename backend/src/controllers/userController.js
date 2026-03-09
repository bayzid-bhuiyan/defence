const prisma = require('../config/db');
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};
exports.getUserInventories = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const inventories = await prisma.inventory.findMany({
      where: { authorId: parseInt(id) },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: inventories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user inventories', error: error.message });
  }
};
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, isAdmin } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isBlocked: isBlocked,
        isAdmin: isAdmin
      },
      select: { id: true, name: true, isBlocked: true, isAdmin: true }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: 'User has inventories/ Block instead', error: error.message });
  }
};