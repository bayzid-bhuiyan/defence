import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Tabs, Tab, Button, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; 
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';
import SettingsTab from '../components/inventory/SettingsTab';
import CustomFieldsTab from '../components/inventory/CustomFieldsTab';
import AccessTab from '../components/inventory/AccessTab';
import ItemsTab from '../components/inventory/ItemsTab';
import DiscussionTab from '../components/inventory/DiscussionTab';
import StatisticsTab from '../components/inventory/StatisticsTab'; 
import CustomIdTab from '../components/inventory/CustomIdTab'; 

const InventoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); 
  const { t } = useTranslation(); 
  
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get(`/inventories/${id}`);
        setInventory(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || t('inventoryView.failed_load', 'Failed to load inventory'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [id, t]);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!inventory) return null;
  const isAuthor = Boolean(user && user.id === inventory.authorId);
  const isAdmin = Boolean(user && user.isAdmin);
  const isShared = Boolean(user && inventory.accessList?.some(u => u.id === user.id));
  const hasWriteAccess = Boolean(isAuthor || isAdmin || isShared);

  const cardBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white border';
  const titleColor = isDark ? 'text-info' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const backBtnColor = isDark ? 'text-info' : 'text-primary';

  return (
    <Container className="mt-4">
      <Button 
        variant="link" 
        className={`text-decoration-none p-0 mb-3 ${backBtnColor}`} 
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" /> {t('inventoryView.back', 'Back')}
      </Button>

      <div className="d-flex align-items-center mb-4">
        {inventory.imageUrl && (
          <img 
            src={inventory.imageUrl} 
            alt={t('inventoryView.cover_alt', 'Cover')} 
            className={`rounded me-4 shadow-sm border ${isDark ? 'border-secondary' : ''}`}
            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
          />
        )}
        <div>
          <h2 className={`mb-1 fw-bold ${titleColor}`}>{inventory.title}</h2>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="secondary" className="text-uppercase">{inventory.category}</Badge>
            <span className={`small ${mutedColor}`}>{t('inventoryView.created_by', { name: inventory.author?.name })}</span>
          </div>
        </div>
      </div>
      <div className={`rounded shadow-sm p-3 ${cardBgClass} ${isDark ? 'dark-tabs' : ''}`}>
        <Tabs defaultActiveKey="items" id="inventory-tabs" className="mb-3">
          
          <Tab eventKey="items" title={t('inventoryView.tabs.items', 'ITEMS')}>
            <ItemsTab inventory={inventory} hasWriteAccess={hasWriteAccess} currentUser={user} />
          </Tab>

          <Tab eventKey="statistics" title={t('inventoryView.tabs.statistics', 'STATISTICS')}>
            <StatisticsTab inventory={inventory} />
          </Tab>
          
          <Tab eventKey="discussion" title={t('inventoryView.tabs.discussion', 'DISCUSSIONS')}>
            <DiscussionTab inventory={inventory} />
          </Tab>

          {hasWriteAccess && (
            <Tab eventKey="fields" title={t('inventoryView.tabs.custom_fields', 'CUSTOM FIELDS')}>
              <CustomFieldsTab 
                inventory={inventory} 
                onUpdate={(updatedData) => setInventory({ ...inventory, ...updatedData })} 
              />
            </Tab>
          )}

          {hasWriteAccess && (
            <Tab eventKey="custom-id" title={t('inventoryView.tabs.custom_ids', 'CUSTOM IDS')}>
              <CustomIdTab 
                inventory={inventory} 
                onUpdate={(updatedData) => setInventory({ ...inventory, ...updatedData })} 
              />
            </Tab>
          )}

          {hasWriteAccess && (
            <Tab eventKey="settings" title={t('inventoryView.tabs.settings', 'SETTINGS')}>
              <SettingsTab 
                inventory={inventory} 
                onUpdate={(updatedData) => setInventory({ ...inventory, ...updatedData })} 
              />
            </Tab>
          )}

          {isAuthor && (
            <Tab eventKey="access" title={t('inventoryView.tabs.access_controls', 'ACCESS CONTROLS')}>
              <AccessTab 
                inventory={inventory} 
                onUpdate={(updatedData) => setInventory({ ...inventory, ...updatedData })} 
              />
            </Tab>
          )}

        </Tabs>
      </div>
    </Container>
  );
};

export default InventoryView;