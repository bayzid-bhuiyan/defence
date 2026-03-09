import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Tabs, Tab, Button, Modal, Form, Table, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Personal = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [myInventories, setMyInventories] = useState([]);
  const [sharedInventories, setSharedInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Equipment',
    image: null
  });
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSharedId, setSelectedSharedId] = useState(null);

  const fetchAllInventories = async () => {
    if (!user) return;
    try {
      const [ownedRes, sharedRes] = await Promise.all([
        api.get(`/inventories?authorId=${user.id}`),
        api.get('/inventories/shared')
      ]);
      
      setMyInventories(ownedRes.data.data || []);
      setSharedInventories(sharedRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch inventories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInventories();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      await api.post('/inventories', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'Equipment', image: null });
      fetchAllInventories(); 
    } catch (error) {
      console.error("Failed to create inventory", error);
      alert(error.response?.data?.message || t('personal.alerts.create_error', 'Error creating inventory'));
    }
  };
  const handleSelectRow = (id) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const handleSelectSharedRow = (id) => {
    setSelectedSharedId(selectedSharedId === id ? null : id);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('personal.alerts.delete_confirm', "Are you sure you want to delete this inventory permanently?"))) return;
    try {
      await api.delete(`/inventories/${selectedId}`);
      setSelectedId(null);
      fetchAllInventories(); 
    } catch (error) {
      alert(t('personal.alerts.delete_error', "Failed to delete inventory."));
    }
  };

  if (!user) return <Container className="mt-5 text-center"><h2 className={isDark ? 'text-white' : ''}>{t('personal.login_required', 'Please login to view this page.')}</h2></Container>;
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const cardBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-white border-0';
  const toolbarBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-light';
  const tabContentClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white border-top-0 border';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';
  const tableVariant = isDark ? 'dark' : 'light';

  return (
    <Container className="mt-4">
      <Card className="mb-4 shadow-sm border-0 bg-primary text-white">
        <Card.Body className="d-flex align-items-center">
          <img 
            src={user.avatar || 'https://via.placeholder.com/80'} 
            alt={t('personal.profile_alt', 'Profile')} 
            className="rounded-circle me-4 border border-light border-3"
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <div>
            <h2 className="mb-1">{user.name}</h2>
            <p className="mb-0 text-white-50">{user.email}</p>
            {user.isAdmin && <Badge bg="danger" className="mt-2">{t('personal.admin_badge', 'Administrator')}</Badge>}
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className={`mb-0 ${textColor}`}>{t('personal.title', 'Inventory Dashboard')}</h3>
        <Button variant="success" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> {t('personal.create_btn', 'Create New')}
        </Button>
      </div>
      <div className={`rounded shadow-sm ${isDark ? 'dark-tabs' : ''}`}>
        <Tabs defaultActiveKey="owned" id="personal-tabs" className="mb-0 border-bottom-0">
          <Tab eventKey="owned" title={t('personal.tabs.owned', 'Owned Inventories')}>
            <div className={`p-3 rounded-bottom ${tabContentClass}`}>
              <div className={`d-flex p-2 rounded border mb-3 shadow-sm align-items-center ${toolbarBgClass}`}>
                <span className={`me-auto small ps-2 ${mutedColor}`}>
                  {selectedId ? t('personal.toolbar.owned_selected', "1 inventory selected") : t('personal.toolbar.owned_unselected', "Select an inventory to manage")}
                </span>
                
                <div className={`border-start ps-3 ${isDark ? 'border-secondary' : ''}`}>
                  <Button 
                    variant={isDark ? "outline-info" : "outline-primary"} size="sm" className="me-2"
                    disabled={!selectedId} onClick={() => navigate(`/inventory/${selectedId}`)}
                  >
                    <FaEye className="me-1" /> {t('personal.toolbar.view_manage', 'View/Manage')}
                  </Button>
                  <Button 
                    variant="outline-danger" size="sm" 
                    disabled={!selectedId} onClick={handleDelete}
                  >
                    <FaTrash className="me-1" /> {t('personal.toolbar.delete', 'Delete')}
                  </Button>
                </div>
              </div>
              <Card className={`shadow-sm ${cardBgClass}`}>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></div>
                  ) : (
                    <Table responsive hover variant={tableVariant} className="mb-0 align-middle">
                      <thead className={isDark ? "table-dark" : "table-light"}>
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th>{t('personal.table.title', 'Title')}</th>
                          <th>{t('personal.table.category', 'Category')}</th>
                          <th>{t('personal.table.items_count', 'Items Count')}</th>
                          <th>{t('personal.table.created', 'Created')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myInventories.length === 0 ? (
                          <tr><td colSpan="5" className={`text-center py-5 ${mutedColor}`}>{t('personal.no_owned', "You haven't created any inventories yet.")}</td></tr>
                        ) : (
                          myInventories.map(inv => (
                            <tr 
                              key={`owned-${inv.id}`} 
                              onClick={() => handleSelectRow(inv.id)}
                              className={selectedId === inv.id ? (isDark ? 'table-secondary text-dark' : 'table-primary') : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>
                                <Form.Check 
                                  type="radio" 
                                  checked={selectedId === inv.id} 
                                  onChange={() => handleSelectRow(inv.id)} 
                                />
                              </td>
                              <td className="fw-bold">{inv.title}</td>
                              <td><Badge bg="secondary">{inv.category}</Badge></td>
                              <td>{t('personal.items_suffix', '{{count}} items', { count: inv.items?.length || 0 })}</td>
                              <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>
          <Tab eventKey="shared" title={t('personal.tabs.shared', 'Shared With Me')}>
            <div className={`p-3 rounded-bottom ${tabContentClass}`}>
              <div className={`d-flex p-2 rounded border mb-3 shadow-sm align-items-center ${toolbarBgClass}`}>
                <span className={`me-auto small ps-2 ${mutedColor}`}>
                  {selectedSharedId ? t('personal.toolbar.shared_selected', "1 shared inventory selected") : t('personal.toolbar.shared_unselected', "Select an inventory to view")}
                </span>
                
                <div className={`border-start ps-3 ${isDark ? 'border-secondary' : ''}`}>
                  <Button 
                    variant={isDark ? "outline-info" : "outline-primary"} size="sm"
                    disabled={!selectedSharedId} onClick={() => navigate(`/inventory/${selectedSharedId}`)}
                  >
                    <FaEye className="me-1" /> {t('personal.toolbar.view_inventory', 'View Inventory')}
                  </Button>
                </div>
              </div>
              <Card className={`shadow-sm ${cardBgClass}`}>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></div>
                  ) : (
                    <Table responsive hover variant={tableVariant} className="mb-0 align-middle">
                      <thead className={isDark ? "table-dark" : "table-light"}>
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th>{t('personal.table.title', 'Title')}</th>
                          <th>{t('personal.table.category', 'Category')}</th>
                          <th>{t('personal.table.owner', 'Owner')}</th>
                          <th>{t('personal.table.items_count', 'Items Count')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sharedInventories.length === 0 ? (
                          <tr>
                            <td colSpan="5" className={`text-center py-5 ${mutedColor}`}>
                              <h5>{t('personal.no_shared', "No inventories have been shared with you yet.")}</h5>
                            </td>
                          </tr>
                        ) : (
                          sharedInventories.map(inv => (
                            <tr 
                              key={`shared-${inv.id}`} 
                              onClick={() => handleSelectSharedRow(inv.id)}
                              className={selectedSharedId === inv.id ? (isDark ? 'table-secondary text-dark' : 'table-primary') : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>
                                <Form.Check 
                                  type="radio" 
                                  checked={selectedSharedId === inv.id} 
                                  onChange={() => handleSelectSharedRow(inv.id)} 
                                />
                              </td>
                              <td className="fw-bold">{inv.title}</td>
                              <td><Badge bg="info" text={isDark ? "dark" : "light"}>{inv.category}</Badge></td>
                              <td>{inv.author?.name || t('personal.unknown_user', 'Unknown')}</td>
                              <td>{t('personal.items_suffix', '{{count}} items', { count: inv.items?.length || 0 })}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" contentClassName={isDark ? 'bg-dark text-white border border-secondary' : ''}>
        <Modal.Header closeButton closeVariant={isDark ? 'white' : undefined} className={isDark ? 'border-secondary' : ''}>
          <Modal.Title>{t('personal.modal.title', 'Create New Inventory')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateInventory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('personal.modal.title_label', 'Title')}</Form.Label>
              <Form.Control 
                type="text" name="title" required 
                value={formData.title} onChange={handleInputChange} 
                placeholder={t('personal.modal.title_placeholder', "e.g., Main Office Electronics")}
                className={inputBgClass}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('personal.modal.category', 'Category')}</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleInputChange} className={inputBgClass}>
                <option value="Equipment">{t('categories.equipment', 'Equipment')}</option>
                <option value="Furniture">{t('categories.furniture', 'Furniture')}</option>
                <option value="Book">{t('categories.book', 'Book')}</option>
                <option value="Other">{t('categories.other', 'Other')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('personal.modal.description', 'Description')}</Form.Label>
              <Form.Control 
                as="textarea" rows={3} name="description" 
                value={formData.description} onChange={handleInputChange} 
                className={inputBgClass}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('personal.modal.image', 'Cover Image (Optional)')}</Form.Label>
              <Form.Control type="file" name="image" accept="image/*" onChange={handleInputChange} className={inputBgClass} />
              <Form.Text className={mutedColor}>{t('personal.modal.image_help', 'Image will be uploaded securely.')}</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className={isDark ? 'border-secondary' : ''}>
            <Button variant={isDark ? "outline-light" : "secondary"} onClick={() => setShowModal(false)}>{t('personal.modal.cancel', 'Cancel')}</Button>
            <Button variant="primary" type="submit">{t('personal.modal.submit', 'Create Inventory')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default Personal;