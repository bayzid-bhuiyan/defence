const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', inventoryController.getAllInventories);
router.get('/shared', isAuthenticated, inventoryController.getSharedInventories);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', isAuthenticated, upload.single('image'), inventoryController.createInventory);
router.patch('/:id', isAuthenticated, inventoryController.updateInventory);
router.delete('/:id', isAuthenticated, inventoryController.deleteInventory); 
router.patch('/:id/auto-save', isAuthenticated, inventoryController.autoSave);
router.post('/:id/access', isAuthenticated, inventoryController.grantAccess);
router.delete('/:id/access', isAuthenticated, inventoryController.revokeAccess);

module.exports = router;