const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');


router.post('/inventory/:inventoryId', isAuthenticated, commentController.addComment);
router.get('/inventory/:inventoryId', commentController.getComments);
module.exports = router;