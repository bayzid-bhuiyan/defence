import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Modal, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const ItemsTab = ({ inventory, hasWriteAccess, currentUser }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Toolbar State
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  // Form State
  const [formData, setFormData] = useState({ name: '', quantity: 1, customFields: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/items/inventory/${inventory.id}`);
      setItems(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [inventory.id]);

  // --- Toolbar Actions ---
  const handleSelectRow = (id) => {
    setSelectedItemId(selectedItemId === id ? null : id); // Toggle selection
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', quantity: 1, customFields: {} });
    setShowModal(true);
  };

  const openEditModal = () => {
    const itemToEdit = items.find(i => i.id === selectedItemId);
    setModalMode('edit');
    setFormData({
      name: itemToEdit.name,
      quantity: itemToEdit.quantity,
      customFields: itemToEdit.customFields || {},
      version: itemToEdit.version // <--- ADDED: Include the version for optimistic locking
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('itemsTab.alerts.delete_confirm', "Delete this item permanently?"))) return;
    try {
      await api.delete(`/items/${selectedItemId}`);
      setSelectedItemId(null); 
      fetchItems(); 
    } catch (error) {
      alert(t('itemsTab.alerts.delete_failed', "Failed to delete item."));
    }
  };

  // --- Like Action ---
  const handleLike = async (e, itemId) => {
    e.stopPropagation(); 
    try {
      await api.post(`/likes/item/${itemId}/toggle`);
      fetchItems(); 
    } catch (error) {
      if (error.response?.status === 401) {
        alert(t('itemsTab.alerts.login_required', "Please log in to like items."));
      } else {
        alert(t('itemsTab.alerts.like_failed', "Failed to like item."));
      }
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (modalMode === 'create') {
        await api.post(`/items/inventory/${inventory.id}`, formData);
      } else {
        await api.patch(`/items/${selectedItemId}`, formData);
      }
      setShowModal(false);
      setSelectedItemId(null);
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.message || t('itemsTab.alerts.save_failed', "Failed to save item."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dynamic Custom Field Handler ---
  const handleCustomFieldChange = (fieldId, value, type) => {
    let parsedValue = value;
    if (type === 'number') parsedValue = value === '' ? '' : Number(value);
    if (type === 'boolean') parsedValue = value === 'true';

    setFormData(prev => ({
      ...prev,
      customFields: { ...prev.customFields, [fieldId]: parsedValue }
    }));
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></div>;

  const visibleCustomFields = inventory.customFieldDefs?.filter(f => f.showInTable) || [];


  const toolbarBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-light';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';
  const tableVariant = isDark ? 'dark' : 'light';
  const selectedRowClass = isDark ? 'table-secondary text-dark' : 'table-primary';

  return (
    <div className="p-2">
  
      {hasWriteAccess && (
        <div className={`d-flex p-2 rounded border mb-3 shadow-sm align-items-center flex-wrap gap-2 ${toolbarBgClass}`}>
          <Button variant="success" size="sm" onClick={openCreateModal}>
            <FaPlus className="me-2" /> {t('itemsTab.add_item', 'Add Item')}
          </Button>
          
          <div className={`border-start ps-3 ms-2 d-flex flex-wrap gap-2 ${isDark ? 'border-secondary' : ''}`}>
            <Button 
              variant={isDark ? "outline-primary" : "outline-primary"} size="sm" 
              disabled={!selectedItemId} onClick={openEditModal}
            >
              <FaEdit className="me-1"/> {t('itemsTab.edit', 'Edit')}
            </Button>
            <Button 
              variant="outline-danger" size="sm" 
              disabled={!selectedItemId} onClick={handleDelete}
            >
              <FaTrash className="me-1"/> {t('itemsTab.delete', 'Delete')}
            </Button>
          </div>
          <span className={`ms-auto small ${mutedColor}`}>
            {selectedItemId ? t('itemsTab.item_selected', "1 item selected") : t('itemsTab.select_item', "Select an item to edit or delete")}
          </span>
        </div>
      )}

      <div className={`table-responsive border rounded shadow-sm ${isDark ? 'border-secondary' : ''}`}>
        <Table hover variant={tableVariant} className="mb-0 align-middle">
          <thead className={isDark ? 'table-dark' : 'table-dark'}>
            <tr>
              {hasWriteAccess && <th style={{ width: '40px' }}></th>}
              <th>{t('itemsTab.table.id', 'ID')}</th>
              <th>{t('itemsTab.table.name', 'Name')}</th>
              <th>{t('itemsTab.table.qty', 'Qty')}</th>
              {visibleCustomFields.map(field => (
                <th key={field.id}>{field.name}</th>
              ))}
              <th>{t('itemsTab.table.likes', 'Likes')}</th>
              <th>{t('itemsTab.table.added', 'Added')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className={`text-center py-4 ${mutedColor}`}>{t('itemsTab.no_items', 'No items in this inventory yet.')}</td>
              </tr>
            ) : (
              items.map(item => {
                const hasLiked = currentUser && item.likes?.some(l => l.userId === currentUser.id);
                
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => hasWriteAccess && handleSelectRow(item.id)}
                    className={selectedItemId === item.id ? selectedRowClass : ''}
                    style={{ cursor: hasWriteAccess ? 'pointer' : 'default' }}
                  >
                    {hasWriteAccess && (
                      <td>
                        <Form.Check 
                          type="radio" 
                          checked={selectedItemId === item.id} 
                          onChange={() => handleSelectRow(item.id)} 
                        />
                      </td>
                    )}
                    <td><Badge bg="secondary">{item.customId}</Badge></td>
                    <td className="fw-bold">{item.name}</td>
                    <td>{item.quantity}</td>
                    
                    {visibleCustomFields.map(field => {
                      let value = item.customFields?.[field.id];
                      if (field.type === 'boolean') value = value ? t('itemsTab.custom.yes', 'Yes') : t('itemsTab.custom.no', 'No');
                      else if (field.type === 'link' && value) value = <a href={value} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{t('itemsTab.custom.link', 'Link')}</a>;
                      
                      return (
                        <td key={field.id}>
                          {value !== undefined && value !== null && value !== '' ? value : '-'}
                        </td>
                      );
                    })}
                    
                    <td>
                      <Button variant="link" className="p-0 text-decoration-none text-danger" onClick={(e) => handleLike(e, item.id)}>
                        {hasLiked ? <FaHeart /> : <FaRegHeart />} <span className={`${isDark ? 'text-light' : 'text-dark'} ms-1`}>{item.likes?.length || 0}</span>
                      </Button>
                    </td>

                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" size="lg" contentClassName={isDark ? 'bg-dark text-white border border-secondary' : ''}>
        <Modal.Header closeButton closeVariant={isDark ? 'white' : undefined} className={isDark ? 'border-secondary' : ''}>
          <Modal.Title>{modalMode === 'create' ? t('itemsTab.modal.add_title', 'Add New Item') : t('itemsTab.modal.edit_title', 'Edit Item')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('itemsTab.modal.item_name', 'Item Name')}</Form.Label>
                  <Form.Control 
                    required type="text" value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={inputBgClass}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('itemsTab.modal.quantity', 'Quantity')}</Form.Label>
                  <Form.Control 
                    required type="number" min="1" value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className={inputBgClass}
                  />
                </Form.Group>
              </Col>
            </Row>

            {inventory.customFieldDefs?.length > 0 && <hr className={isDark ? "border-secondary" : ""} />}
            <Row>
              {inventory.customFieldDefs?.map(field => {
                const value = formData.customFields[field.id];

                return (
                  <Col md={6} key={field.id}>
                    <Form.Group className="mb-3">
                      <Form.Label>{field.name} <small className={mutedColor}>({field.type})</small></Form.Label>
                      
                      {field.type === 'boolean' ? (
                        <Form.Select
                          value={value?.toString() || 'false'}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value, field.type)}
                          className={inputBgClass}
                        >
                          <option value="false">{t('itemsTab.modal.boolean_no', 'No / False')}</option>
                          <option value="true">{t('itemsTab.modal.boolean_yes', 'Yes / True')}</option>
                        </Form.Select>
                      ) : field.type === 'textarea' ? (
                        <Form.Control 
                          as="textarea" rows={2}
                          value={value || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value, field.type)}
                          className={inputBgClass}
                        />
                      ) : field.type === 'link' ? (
                        <Form.Control 
                          type="url" placeholder="https://..."
                          value={value || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value, field.type)}
                          className={inputBgClass}
                        />
                      ) : (
                        <Form.Control 
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={value || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value, field.type)}
                          className={inputBgClass}
                        />
                      )}
                    </Form.Group>
                  </Col>
                );
              })}
            </Row>
          </Modal.Body>
          <Modal.Footer className={isDark ? 'border-secondary' : ''}>
            <Button variant={isDark ? "outline-light" : "secondary"} onClick={() => setShowModal(false)}>{t('itemsTab.modal.cancel', 'Cancel')}</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('itemsTab.modal.saving', 'Saving...') : t('itemsTab.modal.save_btn', 'Save Item')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemsTab;
