const inventoryRepository = require('../repositories/inventoryRepository');
const prisma = require('../config/db'); 

class InventoryService {
  validCategories = ['Equipment', 'Furniture', 'Book', 'Other'];

  _mapCustomFieldDefsToDBFields(defs) {
    const dbFields = {};
    const prefixes = ['string', 'text', 'int', 'link', 'bool', 'date'];
    
    prefixes.forEach(prefix => {
      for (let i = 1; i <= 3; i++) {
        dbFields[`custom_${prefix}${i}_state`] = false;
        dbFields[`custom_${prefix}${i}_name`] = null;
      }
    });

    if (!defs || !Array.isArray(defs)) return dbFields;

    const typeMapping = {
      'text': 'string', 'textarea': 'text', 'number': 'int',
      'link': 'link', 'boolean': 'bool', 'date': 'date'
    };

    const counts = { string: 1, text: 1, int: 1, link: 1, bool: 1, date: 1 };

    defs.forEach(def => {
      const prefix = typeMapping[def.type];
      if (prefix && counts[prefix] <= 3) {
        const index = counts[prefix];
        dbFields[`custom_${prefix}${index}_state`] = def.showInTable !== false; 
        dbFields[`custom_${prefix}${index}_name`] = def.name;
        counts[prefix]++;
      }
    });

    return dbFields;
  }

  _mapDBFieldsToCustomFieldDefs(inventory) {
    const defs = [];
    const prefixes = ['string', 'text', 'int', 'link', 'bool', 'date'];
    const reverseTypeMapping = {
      'string': 'text', 'text': 'textarea', 'int': 'number', 
      'link': 'link', 'bool': 'boolean', 'date': 'date'
    };

    prefixes.forEach(prefix => {
      for (let i = 1; i <= 3; i++) {
        const name = inventory[`custom_${prefix}${i}_name`];
        const state = inventory[`custom_${prefix}${i}_state`];
        
        if (name) { 
          defs.push({
            id: `custom_${prefix}${i}`, 
            name: name,
            type: reverseTypeMapping[prefix],
            showInTable: state
          });
        }
      }
    });
    return defs;
  }

  async createInventory(data, userId) {
    if (!this.validCategories.includes(data.category)) {
      throw new Error(`Invalid category. Must be one of: ${this.validCategories.join(', ')}`);
    }

    let parsedTags = [];
    if (data.tags) {
      try { parsedTags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags; } 
      catch (e) { console.error("Tag parsing error:", e); }
    }
    
    const validTagIds = [];
    if (parsedTags.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { name: { in: parsedTags } }
      });
      
      const existingTagNames = existingTags.map(t => t.name);
      const missingTags = parsedTags.filter(name => !existingTagNames.includes(name));
      
      if (missingTags.length > 0) {
        await prisma.tag.createMany({
          data: missingTags.map(name => ({ name }))
        });
        
        const newTags = await prisma.tag.findMany({
          where: { name: { in: missingTags } }
        });
        existingTags.push(...newTags);
      }
      
      validTagIds.push(...existingTags.map(t => ({ id: t.id })));
    }

    const inventoryData = {
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl || null,
      authorId: userId,
      version: 1,
      customIdFormat: data.customIdFormat || { type: 'numeric', prefix: 'ITEM' },
      ...this._mapCustomFieldDefsToDBFields(data.customFieldDefs),
      tags: { connect: validTagIds } 
    };

    const newInventory = await inventoryRepository.create(inventoryData);
    newInventory.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(newInventory);
    return newInventory;
  }

  async getAllInventories(filters, skip, take) {
    return await inventoryRepository.findAll(filters, skip, take);
  }

  async getSharedInventories(userId) {
    const inventories = await inventoryRepository.findSharedWithUser(userId);
    return inventories.map(inv => {
      inv.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(inv);
      return inv;
    });
  }

  async getInventoryById(id) {
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, name: true, email: true } },
        accessList: { select: { id: true, name: true, email: true } }, 
        tags: true,
        items: true,
        comments: { include: { author: { select: { id: true, name: true } } } }
      }
    });
    
    if (!inventory) throw new Error('Inventory not found');
    inventory.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(inventory);
    return inventory;
  }

  async updateInventory(id, userId, userRole, currentVersion, updateData) {
    const inventory = await prisma.inventory.findUnique({
        where: { id: parseInt(id) },
        include: { accessList: true }
    });
    if (!inventory) throw new Error('Inventory not found');

    const isAuthor = inventory.authorId === userId;
    const isAdmin = userRole === 'admin';
    const isShared = inventory.accessList.some(u => u.id === userId);

    if (!isAuthor && !isAdmin && !isShared) {
      throw new Error('Unauthorized: You do not have permission to edit this inventory.');
    }

    if (updateData.category && !this.validCategories.includes(updateData.category)) {
      throw new Error(`Invalid category. Must be one of: ${this.validCategories.join(', ')}`);
    }

    let finalUpdateData = { ...updateData };
    
    if (finalUpdateData.customFieldDefs) {
      const mappedFields = this._mapCustomFieldDefsToDBFields(finalUpdateData.customFieldDefs);
      finalUpdateData = { ...finalUpdateData, ...mappedFields };
      delete finalUpdateData.customFieldDefs; 
    }
    
    if (finalUpdateData.tags !== undefined) {
      let parsedTags = [];
      try {
        parsedTags = typeof finalUpdateData.tags === 'string' 
          ? JSON.parse(finalUpdateData.tags) 
          : finalUpdateData.tags;
      } catch (e) {
        console.error("Tag parsing error during update:", e);
      }
      

      const validTagIds = [];
      if (parsedTags.length > 0) {
        const existingTags = await prisma.tag.findMany({
          where: { name: { in: parsedTags } }
        });
        
        const existingTagNames = existingTags.map(t => t.name);
        const missingTags = parsedTags.filter(name => !existingTagNames.includes(name));
        
        if (missingTags.length > 0) {
          await prisma.tag.createMany({
            data: missingTags.map(name => ({ name }))
          });
          
          const newTags = await prisma.tag.findMany({
            where: { name: { in: missingTags } }
          });
          existingTags.push(...newTags);
        }
        
        validTagIds.push(...existingTags.map(t => ({ id: t.id })));
      }

      finalUpdateData.tags = {
        set: validTagIds 
      };
    }

    try {
      const updatedInventory = await inventoryRepository.updateWithVersion(id, currentVersion, finalUpdateData);
      updatedInventory.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(updatedInventory);
      return updatedInventory;

    } catch (error) {
      if (error.code === 'P2025') {
         throw new Error('Conflict: Someone else updated this inventory while you were editing. Please refresh.');
      }
      throw error; 
    }
  }

  async grantAccess(inventoryId, ownerId, targetEmail) {
    const inventory = await inventoryRepository.findById(inventoryId);
    if (!inventory) throw new Error('Inventory not found');
    if (inventory.authorId !== ownerId) throw new Error('Only the owner can share this inventory.');

    const userTbShare = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!userTbShare) throw new Error('User with this email not found.');

    const updated = await prisma.inventory.update({
      where: { id: parseInt(inventoryId) },
      data: { accessList: { connect: { id: userTbShare.id } } },
      include: { accessList: true }
    });
    updated.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(updated);
    return updated;
  }

  async revokeAccess(inventoryId, ownerId, targetUserId) {
    const inventory = await inventoryRepository.findById(inventoryId);
    if (!inventory) throw new Error('Inventory not found');
    if (inventory.authorId !== ownerId) throw new Error('Only the owner can manage access.');

    const updated = await prisma.inventory.update({
      where: { id: parseInt(inventoryId) },
      data: { accessList: { disconnect: { id: parseInt(targetUserId) } } },
      include: { accessList: true }
    });
    updated.customFieldDefs = this._mapDBFieldsToCustomFieldDefs(updated);
    return updated;
  }

  async deleteInventory(id, userId, userRole) {
    const inventory = await inventoryRepository.findById(id);
    if (!inventory) throw new Error('Inventory not found');
    
    const isAuthor = inventory.authorId === userId;
    const isAdmin = userRole === 'admin';
    if (!isAuthor && !isAdmin) {
        throw new Error('Unauthorized: You do not have permission to delete this inventory.');
    }
    
    return await inventoryRepository.delete(id);
  }
}

module.exports = new InventoryService();
