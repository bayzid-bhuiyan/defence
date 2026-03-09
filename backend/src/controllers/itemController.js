const itemService = require('../services/itemService');

exports.createItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const newItem = await itemService.createItem(req.user.id, parseInt(inventoryId), req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getItemsByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const items = await itemService.getItemsByInventory(parseInt(inventoryId));
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await itemService.updateItem(req.user.id, parseInt(id), req.body);
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await itemService.deleteItem(req.user.id, parseInt(id));
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};