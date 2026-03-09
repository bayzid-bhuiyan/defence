import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Form, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaUserShield, FaBan, FaCheck, FaTrash, FaUserTie, FaList, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../services/api';

const Admin = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showInvModal, setShowInvModal] = useState(false);
  const [userInventories, setUserInventories] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [selectedInvIds, setSelectedInvIds] = useState([]);
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const cardBgColor = isDark ? 'dark' : 'white';
  const toolbarBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-light';

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSelectRow = (id) => {
    setSelectedUserId(selectedUserId === id ? null : id);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleToggleStatus = async (newIsBlocked, newIsAdmin) => {
    if (!selectedUserId) return;
    try {
      await api.patch(`/users/${selectedUserId}/status`, {
        isBlocked: newIsBlocked,
        isAdmin: newIsAdmin
      });
      
      if (selectedUserId === user.id) {
        if (newIsBlocked) {
          window.location.href = '/blocked';
          return;
        }
        if (!newIsAdmin) {
          window.location.href = '/';
          return;
        }
      }
      fetchUsers(); 
    } catch (error) {
      alert(error.response?.data?.message || t('admin.alerts.update_failed'));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    const isSelf = selectedUserId === user.id;
    const warningMsg = isSelf 
      ? t('admin.alerts.delete_self_warning')
      : t('admin.alerts.delete_user_warning');

    if (!window.confirm(warningMsg)) return;
    
    try {
      await api.delete(`/users/${selectedUserId}`);
      
      if (isSelf) {
        await logout(); 
        window.location.href = '/'; 
        return;
      }
      setSelectedUserId(null);
      fetchUsers(); 
    } catch (error) {
      alert(error.response?.data?.message || t('admin.alerts.delete_user_failed'));
    }
  };

  const handleShowInventories = async () => {
    if (!selectedUserId) return;
    setShowInvModal(true);
    setInvLoading(true);
    setSelectedInvIds([]); 
    
    try {
      const response = await api.get(`/users/${selectedUserId}/inventories`);
      setUserInventories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch user inventories", error);
      alert(error.response?.data?.message || t('admin.alerts.fetch_inv_failed'));
    } finally {
      setInvLoading(false);
    }
  };

  const handleSelectInventory = (invId) => {
    setSelectedInvIds(prev => 
      prev.includes(invId) ? prev.filter(id => id !== invId) : [...prev, invId]
    );
  };

  const handleSelectAllInventories = () => {
    if (selectedInvIds.length === userInventories.length) {
      setSelectedInvIds([]); 
    } else {
      setSelectedInvIds(userInventories.map(inv => inv.id)); 
    }
  };

  const handleBulkDeleteInventories = async () => {
    if (selectedInvIds.length === 0) return;
    if (!window.confirm(t('admin.alerts.bulk_delete_warning', { count: selectedInvIds.length }))) return;

    try {
      await Promise.all(
        selectedInvIds.map(id => api.delete(`/inventories/${id}`))
      );
      
      const response = await api.get(`/users/${selectedUserId}/inventories`);
      setUserInventories(response.data.data || []);
      setSelectedInvIds([]);
      
    } catch (error) {
      console.error("Failed to delete some inventories", error);
      alert(t('admin.alerts.bulk_delete_error'));
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></Container>;
  
  if (!user || !user.isAdmin) {
    return (
      <Container className="text-center mt-5">
        <h2 className="text-danger">🛡️ {t('admin.access_denied')}</h2>
        <p className={textColor}>{t('admin.admin_only_msg')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className={`mb-4 ${textColor}`}>🛡️ {t('admin.title')}</h2>
      <div className={`d-flex p-2 rounded border mb-3 shadow-sm align-items-center flex-wrap gap-2 ${toolbarBgClass}`}>
        <span className={`me-auto small ps-2 ${isDark ? 'text-white' : 'text-muted'}`}>
          {selectedUser ? t('admin.selected', { name: selectedUser.name }) : t('admin.select_user')}
        </span>
        
        <div className={`border-start ps-3 d-flex flex-wrap gap-2 ${isDark ? 'border-secondary' : ''}`}>
          <Button 
            variant={isDark ? "outline-info" : "outline-info"} 
            size="sm" 
            disabled={!selectedUserId} 
            onClick={handleShowInventories}
          >
            <FaList className="me-1" /> {t('admin.show_inventories')}
          </Button>

          <Button 
            variant={selectedUser?.isAdmin ? "outline-warning" : "outline-primary"} 
            size="sm" 
            disabled={!selectedUserId} 
            onClick={() => handleToggleStatus(selectedUser?.isBlocked, !selectedUser?.isAdmin)}
          >
            {selectedUser?.isAdmin ? <><FaUserTie className="me-1" /> {t('admin.remove_admin')}</> : <><FaUserShield className="me-1" /> {t('admin.make_admin')}</>}
          </Button>

          <Button 
            variant={selectedUser?.isBlocked ? "outline-success" : "outline-warning"} 
            size="sm" 
            disabled={!selectedUserId} 
            onClick={() => handleToggleStatus(!selectedUser?.isBlocked, selectedUser?.isAdmin)}
          >
            {selectedUser?.isBlocked ? <><FaCheck className="me-1" /> {t('admin.unblock_user')}</> : <><FaBan className="me-1" /> {t('admin.block_user')}</>}
          </Button>

          <Button 
            variant="outline-danger" size="sm" 
            disabled={!selectedUserId} onClick={handleDeleteUser}
          >
            <FaTrash className="me-1" /> {t('admin.delete_user')}
          </Button>
        </div>
      </div>

      <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className={`shadow-sm ${isDark ? 'border-secondary' : 'border-0'}`}>
        <Card.Body className="p-0">
          <Table responsive hover variant={isDark ? 'dark' : 'light'} className="mb-0 align-middle">
            <thead className={isDark ? 'table-dark' : 'table-dark'}>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>{t('admin.table.user')}</th>
                <th>{t('admin.table.email')}</th>
                <th>{t('admin.table.role')}</th>
                <th>{t('admin.table.status')}</th>
                <th>{t('admin.table.joined_date')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((targetUser) => (
                <tr 
                  key={targetUser.id} 
                  onClick={() => handleSelectRow(targetUser.id)}
                  className={selectedUserId === targetUser.id ? (isDark ? 'table-secondary' : 'table-primary') : ''}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <Form.Check 
                      type="radio" 
                      checked={selectedUserId === targetUser.id} 
                      onChange={() => handleSelectRow(targetUser.id)} 
                    />
                  </td>
                  <td>
                    <img 
                      src={targetUser.avatar || 'https://via.placeholder.com/40'} 
                      alt="avatar" 
                      className="rounded-circle me-2" 
                      style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                    />
                    <span className="fw-bold">{targetUser.name}</span>
                  </td>
                  <td>{targetUser.email}</td>
                  <td>
                    {targetUser.isAdmin ? (
                      <Badge bg="primary"><FaUserShield className="me-1"/> {t('admin.roles.admin')}</Badge>
                    ) : (
                      <Badge bg="secondary">{t('admin.roles.user')}</Badge>
                    )}
                  </td>
                  <td>
                    {targetUser.isBlocked ? (
                      <Badge bg="danger"><FaBan className="me-1"/> {t('admin.statuses.blocked')}</Badge>
                    ) : (
                      <Badge bg="success"><FaCheck className="me-1"/> {t('admin.statuses.active')}</Badge>
                    )}
                  </td>
                  <td>{new Date(targetUser.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showInvModal} onHide={() => setShowInvModal(false)} size="lg" centered contentClassName={isDark ? 'bg-dark text-white border border-secondary' : ''}>
        <Modal.Header closeButton closeVariant={isDark ? 'white' : undefined} className={isDark ? 'border-secondary' : 'bg-light'}>
          <Modal.Title className="fs-5">
            📦 {t('admin.modal.title')} <span className={isDark ? "text-info" : "text-primary"}>{selectedUser?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className={`p-3 border-bottom d-flex justify-content-between align-items-center ${isDark ? 'border-secondary' : 'bg-white'}`}>
            <span className={`${mutedColor} small fw-bold`}>
              {t('admin.modal.selected_count', { count: selectedInvIds.length })}
            </span>
            <Button 
              variant="danger" 
              size="sm" 
              disabled={selectedInvIds.length === 0}
              onClick={handleBulkDeleteInventories}
            >
              <FaTrash className="me-1" /> {t('admin.modal.delete_selected')}
            </Button>
          </div>

          {invLoading ? (
            <div className="text-center py-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></div>
          ) : userInventories.length === 0 ? (
            <div className={`text-center py-5 ${mutedColor}`}>{t('admin.modal.no_inventories')}</div>
          ) : (
            <Table responsive hover variant={isDark ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead className={isDark ? "table-dark" : "table-light"}>
                <tr>
                  <th style={{ width: '40px', paddingLeft: '20px' }}>
                    <Form.Check 
                      type="checkbox" 
                      checked={selectedInvIds.length === userInventories.length && userInventories.length > 0}
                      onChange={handleSelectAllInventories}
                    />
                  </th>
                  <th>{t('admin.modal.table.title')}</th>
                  <th>{t('admin.modal.table.category')}</th>
                  <th>{t('admin.modal.table.date_created')}</th>
                  <th className="text-center">{t('admin.modal.table.action')}</th>
                </tr>
              </thead>
              <tbody>
                {userInventories.map(inv => (
                  <tr key={inv.id} className={selectedInvIds.includes(inv.id) ? (isDark ? 'table-secondary text-dark' : 'table-danger') : ''}>
                    <td style={{ paddingLeft: '20px' }}>
                      <Form.Check 
                        type="checkbox" 
                        checked={selectedInvIds.includes(inv.id)}
                        onChange={() => handleSelectInventory(inv.id)}
                      />
                    </td>
                    <td className="fw-bold">{inv.title}</td>
                    <td><Badge bg="secondary">{inv.category}</Badge></td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <Button 
                        as={Link} 
                        to={`/inventory/${inv.id}`} 
                        variant={isDark ? "outline-info" : "outline-primary"} 
                        size="sm"
                        target="_blank"
                      >
                        <FaExternalLinkAlt /> {t('admin.modal.visit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Admin;