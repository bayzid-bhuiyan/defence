const express = require('express');
const itemController = require('../controllers/itemController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/inventory/:inventoryId', isAuthenticated, itemController.createItem);
router.get('/inventory/:inventoryId', itemController.getItemsByInventory);
router.patch('/:id', isAuthenticated, itemController.updateItem);
router.delete('/:id', isAuthenticated, itemController.deleteItem);
module.exports = router;