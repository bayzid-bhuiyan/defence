const itemRepository = require('../repositories/itemRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const prisma = require('../config/db'); 
const crypto = require('crypto');

class ItemService {
  _mapCustomFieldsToDBValues(customFields) {
    const dbValues = {};
    const prefixes = ['string', 'text', 'int', 'link', 'bool', 'date'];

    if (!customFields || typeof customFields !== 'object') return dbValues;

    prefixes.forEach(prefix => {
      for (let i = 1; i <= 3; i++) {
        const fieldId = `custom_${prefix}${i}`; 
        const valueKey = `${fieldId}_value`;    
        
        if (customFields[fieldId] !== undefined) {
          let val = customFields[fieldId];
          
          if (val === '') val = null;

          if (val !== null) {
            if (prefix === 'int') val = parseInt(val, 10);
            else if (prefix === 'bool') val = Boolean(val);
            else if (prefix === 'date') val = new Date(val).toISOString();
          }
          
          dbValues[valueKey] = val;
        }
      }
    });

    return dbValues;
  }

  _mapDBValuesToCustomFields(item) {
    const customFields = {};
    const prefixes = ['string', 'text', 'int', 'link', 'bool', 'date'];

    prefixes.forEach(prefix => {
      for (let i = 1; i <= 3; i++) {
        const fieldId = `custom_${prefix}${i}`;
        const dbKey = `${fieldId}_value`;
        
        if (item[dbKey] !== undefined && item[dbKey] !== null) {
          customFields[fieldId] = item[dbKey];
        }
      }
    });

    return customFields;
  }

  async createItem(userId, inventoryId, itemData) {
    const inventory = await prisma.inventory.findUnique({
        where: { id: parseInt(inventoryId) },
        include: { accessList: true }
    });
    
    if (!inventory) throw new Error('Inventory not found');

    const isAuthor = inventory.authorId === userId;
    const hasAccess = inventory.accessList.some(u => u.id === userId);
    
    if (!isAuthor && !hasAccess) {
        throw new Error('Unauthorized: You do not have write access to this inventory.');
    }

    const generatedId = await this.generateCustomId(inventoryId, inventory.customIdFormat);

    let tagsQuery = {};
    if (itemData.tags && Array.isArray(itemData.tags)) {
      tagsQuery = {
        connectOrCreate: itemData.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      };
    }

    const mappedCustomFields = this._mapCustomFieldsToDBValues(itemData.customFields);

    const data = {
      name: itemData.name,
      quantity: parseInt(itemData.quantity) || 1,
      customId: generatedId,
      version: 1, 
      tags: tagsQuery,
      ...mappedCustomFields 
    };

    const newItem = await itemRepository.create(inventoryId, data);
    
    newItem.customFields = this._mapDBValuesToCustomFields(newItem);
    return newItem;
  }

  async generateCustomId(inventoryId, format) {
    if (!format) return crypto.randomBytes(4).toString('hex').toUpperCase();

    let blocks = format;
    if (!Array.isArray(blocks)) {
      blocks = [
        { type: 'FIXED', value: blocks.prefix ? blocks.prefix + '-' : 'ITEM-' },
        { type: blocks.type === 'date' ? 'DATE' : blocks.type === 'random' ? 'RANDOM_20' : 'SEQUENCE' }
      ];
    }

    let finalId = '';
    let sequenceCount = null;

    for (const block of blocks) {
      switch (block.type) {
        case 'FIXED':
          finalId += (block.value || '');
          break;
        case 'SEQUENCE':
          if (sequenceCount === null) {
       
            const count = await prisma.item.count({ where: { inventoryId: parseInt(inventoryId) } });
            sequenceCount = count + 1;
          }
          finalId += String(sequenceCount).padStart(3, '0');
          break;
        case 'RANDOM_20':
          finalId += crypto.randomBytes(3).toString('hex').substring(0, 5).toUpperCase();
          break;
        case 'RANDOM_32':
          finalId += crypto.randomBytes(4).toString('hex').toUpperCase();
          break;
        case 'GUID':
          finalId += crypto.randomUUID().toUpperCase();
          break;
        case 'DATE':
          finalId += new Date().toISOString().slice(0, 10).replace(/-/g, '');
          break;
      }
    }

    if (!finalId) finalId = crypto.randomBytes(4).toString('hex').toUpperCase();

    const candidates = [finalId];
    const separator = finalId.endsWith('-') ? '' : '-';
    for (let i = 1; i <= 20; i++) {
      candidates.push(`${finalId}${separator}${String(i).padStart(3, '0')}`);
    }

    const existingItems = await prisma.item.findMany({
      where: {
        inventoryId: parseInt(inventoryId),
        customId: { in: candidates }
      },
      select: { customId: true }
    });

    const existingIds = new Set(existingItems.map(item => item.customId));


    let testId = candidates.find(candidate => !existingIds.has(candidate));

    if (!testId) {
      testId = `${finalId}${separator}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }

    return testId;
  }

  async getItemsByInventory(inventoryId) {
    const items = await itemRepository.findAll({ inventoryId: parseInt(inventoryId) });
    return items.map(item => {
      item.customFields = this._mapDBValuesToCustomFields(item);
      return item;
    });
  }

  async updateItem(userId, itemId, updateData) {
    const item = await prisma.item.findUnique({
        where: { id: parseInt(itemId) },
        include: { inventory: { include: { accessList: true } } }
    });

    if (!item) throw new Error('Item not found');

    const inventory = item.inventory;
    const isAuthor = inventory.authorId === userId;
    const hasAccess = inventory.accessList.some(u => u.id === userId);

    if (!isAuthor && !hasAccess) {
      throw new Error('Unauthorized: You do not have write access to this item.');
    }


    if (updateData.version === undefined) {
      throw new Error('Version is required to update this item.');
    }
    
    const currentVersion = updateData.version;
    delete updateData.version; 

    let tagsQuery = undefined;
    if (updateData.tags && Array.isArray(updateData.tags)) {
      tagsQuery = {
        connectOrCreate: updateData.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      };
    }

    const data = {
      ...updateData,
      tags: tagsQuery,
    };
    
    delete data.tags; 
    if (tagsQuery) data.tags = tagsQuery;
    if (data.customId) delete data.customId; 

    if (data.customFields) {
      const mappedFields = this._mapCustomFieldsToDBValues(data.customFields);
      Object.assign(data, mappedFields);
      delete data.customFields; 
    }

    try {
   
      const updatedItem = await itemRepository.updateWithVersion(itemId, currentVersion, data);
      updatedItem.customFields = this._mapDBValuesToCustomFields(updatedItem);
      return updatedItem;
    } catch (error) {
   (Conflict!)
      if (error.code === 'P2025') {
        throw new Error('Conflict: Someone else updated this item while you were editing. Please refresh to see their changes.');
      }
      throw error;
    }
  }

  async deleteItem(userId, itemId) {
    const item = await prisma.item.findUnique({
        where: { id: parseInt(itemId) },
        include: { inventory: { include: { accessList: true } } }
    });

    if (!item) throw new Error('Item not found');

    const inventory = item.inventory;
    const isAuthor = inventory.authorId === userId;
    const hasAccess = inventory.accessList.some(u => u.id === userId);

    if (!isAuthor && !hasAccess) {
      throw new Error('Unauthorized: You do not have permission to delete this item.');
    }

    return await itemRepository.delete(itemId);
  }
}

module.exports = new ItemService();
