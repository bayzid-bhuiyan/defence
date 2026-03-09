import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { FaBoxOpen, FaCubes, FaHeart, FaTags, FaChartLine } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const StatisticsTab = ({ inventory }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(`/items/inventory/${inventory.id}`);
        setItems(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch items for stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [inventory.id]);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></div>;

  if (items.length === 0) {
    return (
      <div className={`text-center p-5 ${isDark ? 'text-light opacity-75' : 'text-muted'}`}>
        <FaChartLine size={40} className="mb-3 opacity-50" />
        <h5>{t('statisticsTab.empty_title', 'No data available yet')}</h5>
        <p>{t('statisticsTab.empty_desc', 'Add some items to this inventory to see statistics and insights.')}</p>
      </div>
    );
  }

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalLikes = items.reduce((sum, item) => sum + (item.likes?.length || 0), 0);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentItemsCount = items.filter(item => new Date(item.createdAt) > oneWeekAgo).length;
  const recentPercentage = Math.round((recentItemsCount / totalItems) * 100);

  const inventoryTags = Array.isArray(inventory.tags) ? inventory.tags : [];
  const textColor = isDark ? 'text-light' : 'text-secondary';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const tagsBgClass = isDark ? 'bg-dark border border-secondary text-white' : 'bg-light border shadow-sm';
  const cardBgClass = isDark ? 'bg-dark text-white border-secondary' : 'border-0';
  const cardHeaderClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-white border-bottom-0';

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className={`mb-0 ${textColor}`}><FaChartLine className="me-2" /> {t('statisticsTab.title', 'Inventory Insights')}</h4>
      </div>
      {inventoryTags.length > 0 && (
        <div className={`mb-4 p-3 rounded ${tagsBgClass}`}>
          <span className={`small text-uppercase fw-bold me-2 ${mutedColor}`}><FaTags className="me-1"/> {t('statisticsTab.inventory_tags', 'Inventory Tags:')}</span>
          {inventoryTags.map((tag, idx) => (
            <Badge bg={isDark ? "info" : "primary"} text={isDark ? "dark" : "light"} key={idx} className="me-2 p-2 fs-6">
              {tag.name || tag}
            </Badge>
          ))}
        </div>
      )}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-primary text-white h-100">
            <Card.Body className="d-flex align-items-center">
              <FaBoxOpen size={40} className="me-3 opacity-75" />
              <div>
                <h6 className="mb-0 text-uppercase fw-bold opacity-75">{t('statisticsTab.metrics.unique_items', 'Unique Items')}</h6>
                <h2 className="mb-0 fw-bold">{totalItems}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-success text-white h-100">
            <Card.Body className="d-flex align-items-center">
              <FaCubes size={40} className="me-3 opacity-75" />
              <div>
                <h6 className="mb-0 text-uppercase fw-bold opacity-75">{t('statisticsTab.metrics.total_quantity', 'Total Quantity')}</h6>
                <h2 className="mb-0 fw-bold">{totalQuantity}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-danger text-white h-100">
            <Card.Body className="d-flex align-items-center">
              <FaHeart size={40} className="me-3 opacity-75" />
              <div>
                <h6 className="mb-0 text-uppercase fw-bold opacity-75">{t('statisticsTab.metrics.total_likes', 'Total Likes')}</h6>
                <h2 className="mb-0 fw-bold">{totalLikes}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8} className="mx-auto">
          <Card className={`shadow-sm h-100 ${cardBgClass}`}>
            <Card.Header className={`pt-3 ${cardHeaderClass}`}>
              <h5 className="mb-0">{t('statisticsTab.recent_activity', 'Recent Activity (Last 7 Days)')}</h5>
            </Card.Header>
            <Card.Body>
              <h1 className={`display-4 fw-bold mb-0 ${isDark ? 'text-info' : 'text-primary'}`}>{recentItemsCount}</h1>
              <p className={`${mutedColor} mb-4`}>{t('statisticsTab.new_items_added', 'New items added recently')}</p>
              
              <div className="mb-1 d-flex justify-content-between">
                <small className="fw-bold">{t('statisticsTab.inventory_growth', 'Inventory Growth')}</small>
                <small>{t('statisticsTab.percentage_of_total', '{{percent}}% of total', { percent: recentPercentage })}</small>
              </div>
              <ProgressBar 
                now={recentPercentage} 
                variant={isDark ? "info" : "primary"} 
                style={{ height: '10px', backgroundColor: isDark ? '#343a40' : '#e9ecef' }} 
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsTab;