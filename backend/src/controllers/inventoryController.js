const inventoryService = require('../services/inventoryService');
const inventoryRepository = require('../repositories/inventoryRepository');

exports.createInventory = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    const inventoryData = { ...req.body, imageUrl };

    const newInventory = await inventoryService.createInventory(inventoryData, req.user.id);
    res.status(201).json({ success: true, data: newInventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllInventories = async (req, res) => {
  try {
    const { search, category, authorId, page = 1, limit = 10 } = req.query;

    if (search) {
      const searchResults = await inventoryRepository.search(search);
      return res.status(200).json({ success: true, data: searchResults });
    }

    const filters = {};
    if (category) filters.category = category;
    if (authorId) filters.authorId = parseInt(authorId);
    
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const inventories = await inventoryService.getAllInventories(filters, skip, take);
    res.status(200).json({ success: true, data: inventories });
  } catch (error) {
    console.error('Get All Inventories Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getSharedInventories = async (req, res) => {
  try {
    const sharedInventories = await inventoryService.getSharedInventories(req.user.id);
    res.status(200).json({ success: true, data: sharedInventories });
  } catch (error) {
    console.error('Get Shared Inventories Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shared inventories' });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryById(req.params.id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { version, ...updateData } = req.body; 

    if (version === undefined) {
      return res.status(400).json({ success: false, message: 'Version is required for updates.' });
    }

    const updatedInventory = await inventoryService.updateInventory(
      id, 
      req.user.id, 
      req.user.isAdmin ? 'admin' : 'user', 
      Number(version), 
      updateData
    );

    res.status(200).json({ success: true, data: updatedInventory });
  } catch (error) {
    if (error.message.includes('Conflict')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.autoSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentVersion, ...updateData } = req.body; 

    if (!currentVersion) {
      return res.status(400).json({ success: false, message: 'currentVersion is required for updates.' });
    }

    const updatedInventory = await inventoryService.updateInventory(
      id, 
      req.user.id, 
      req.user.isAdmin ? 'admin' : 'user', 
      Number(currentVersion), 
      updateData
    );

    res.status(200).json({ success: true, data: updatedInventory });
  } catch (error) {
    if (error.message.includes('Conflict')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteInventory(
      id, 
      req.user.id, 
      req.user.isAdmin ? 'admin' : 'user'
    );
    
    res.status(200).json({ success: true, message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
exports.grantAccess = async (req, res) => {
  try {
    const { id } = req.params; 
    const { email } = req.body; 
    
    const updatedInventory = await inventoryService.grantAccess(id, req.user.id, email);
    res.status(200).json({ success: true, message: `Access granted to ${email}`, data: updatedInventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId } = req.body; 
    
    const updatedInventory = await inventoryService.revokeAccess(id, req.user.id, userId);
    res.status(200).json({ success: true, message: 'Access revoked', data: updatedInventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};