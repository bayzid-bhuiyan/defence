const express = require('express');
const router = express.Router();
const prisma = require('../config/db'); 
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.post('/item/:itemId/toggle', isAuthenticated, async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const userId = req.user.id;
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_itemId: {
          userId: userId,
          itemId: itemId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.status(200).json({ success: true, status: 'unliked' });
    } else {
      await prisma.like.create({
        data: {
          userId: userId,
          itemId: itemId 
        }
      });
      return res.status(201).json({ success: true, status: 'liked' });
    }
  } catch (error) {
    console.error('Like Error:', error);
    res.status(500).json({ success: false, message: 'Server error handling like' });
  }
});

module.exports = router;