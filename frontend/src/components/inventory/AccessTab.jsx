import React, { useState, useContext } from 'react';
import { Form, Button, ListGroup, Card, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const AccessTab = ({ inventory, onUpdate }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/inventories/${inventory.id}/access`, { email: emailInput });
      onUpdate(response.data.data);
      setEmailInput(''); 
    } catch (error) {
      console.error("Failed to grant access", error);
      alert(error.response?.data?.message || t('accessTab.alerts.grant_failed', 'User not found or error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRevokeAccess = async (userId, userName) => {
    if (!window.confirm(t('accessTab.alerts.revoke_confirm', { name: userName }))) return;

    try {
      const response = await api.delete(`/inventories/${inventory.id}/access`, {
        data: { userId: userId }
      });
      onUpdate(response.data.data);
    } catch (error) {
      console.error("Failed to revoke access", error);
      alert(error.response?.data?.message || t('accessTab.alerts.revoke_failed', 'Failed to remove user.'));
    }
  };
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const cardBgClass = isDark ? 'bg-dark border border-secondary' : 'bg-light border-0';
  const listBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-white';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';

  return (
    <div className="p-2">
      <div className="mb-4">
        <h4 className={`mb-1 ${textColor}`}>{t('accessTab.title', 'Access Management')}</h4>
        <p className={`${mutedColor} small`}>{t('accessTab.subtitle', 'Users listed here have full write access to add, edit, and delete items in this inventory.')}</p>
      </div>

      <Card className={`shadow-sm mb-4 ${cardBgClass}`}>
        <Card.Body>
          <Form onSubmit={handleGrantAccess}>
            <Form.Label className={`fw-bold ${textColor}`}>{t('accessTab.grant_title', 'Grant Write Access')}</Form.Label>
            <InputGroup>
              <Form.Control
                type="email"
                placeholder={t('accessTab.email_placeholder', "Enter user's exact email address...")}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={inputBgClass}
                required
              />
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner animation="border" size="sm" /> : <><FaUserPlus className="me-2"/> {t('accessTab.share_btn', 'Share')}</>}
              </Button>
            </InputGroup>
            <Form.Text className={mutedColor}>
              {t('accessTab.help_text', 'The user must already have an account on InventoryPro.')}
            </Form.Text>
          </Form>
        </Card.Body>
      </Card>

      <h5 className={`mb-3 ${textColor}`}>{t('accessTab.list_title', 'Current Access List')}</h5>
      <ListGroup variant="flush" className={`rounded shadow-sm ${isDark ? 'border border-secondary' : 'border'}`}>
        <ListGroup.Item className={`d-flex justify-content-between align-items-center py-3 ${listBgClass}`}>
          <div className="d-flex align-items-center">
            <FaShieldAlt className="text-primary me-3 fs-4" />
            <div>
              <p className="mb-0 fw-bold">{inventory.author?.name} <Badge bg="primary" className="ms-2">{t('accessTab.roles.owner', 'Owner')}</Badge></p>
              <small className={mutedColor}>{inventory.author?.email}</small>
            </div>
          </div>
        </ListGroup.Item>
        {inventory.accessList && inventory.accessList.length > 0 ? (
          inventory.accessList.map((sharedUser) => (
            <ListGroup.Item key={sharedUser.id} className={`d-flex justify-content-between align-items-center py-3 border-top ${isDark ? 'border-secondary' : ''} ${listBgClass}`}>
              <div className="d-flex align-items-center">
                <img 
                  src={sharedUser.avatar || 'https://via.placeholder.com/40'} 
                  alt={t('accessTab.avatar_alt', 'Avatar')} 
                  className="rounded-circle me-3"
                  style={{ width: '32px', height: '32px' }}
                />
                <div>
                  <p className="mb-0 fw-bold">{sharedUser.name} <Badge bg="info" text="dark" className="ms-2">{t('accessTab.roles.editor', 'Editor')}</Badge></p>
                  <small className={mutedColor}>{sharedUser.email}</small>
                </div>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => handleRevokeAccess(sharedUser.id, sharedUser.name)}
                title={t('accessTab.remove_title', 'Revoke Access')}
              >
                <FaUserMinus className="me-1" /> {t('accessTab.remove_btn', 'Remove')}
              </Button>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className={`text-center py-4 border-top ${isDark ? 'border-secondary' : ''} ${mutedColor} ${listBgClass}`}>
            {t('accessTab.private_msg', 'This inventory is private. You have not shared it with anyone.')}
          </ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
};

export default AccessTab;