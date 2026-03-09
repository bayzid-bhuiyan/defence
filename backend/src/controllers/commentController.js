const prisma = require('../config/db');

exports.addComment = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { content } = req.body;
    const io = req.app.get('io'); 
    const newComment = await prisma.comment.create({
      data: {
        content,
        inventoryId: parseInt(inventoryId),
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });
    io.to(`inventory_${inventoryId}`).emit('new_comment', newComment);

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { inventoryId: parseInt(inventoryId) },
      orderBy: { createdAt: 'asc' }, 
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};