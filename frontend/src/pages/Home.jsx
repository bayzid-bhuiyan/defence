import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Badge, Spinner, Card, Alert, Button } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaList, FaThLarge, FaImage } from 'react-icons/fa'; 
import api from '../services/api';
import { ThemeContext } from '../context/ThemeContext'; 

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagData, setTagData] = useState([]);
  const [topInventories, setTopInventories] = useState([]);

  const [viewMode, setViewMode] = useState(localStorage.getItem('homeViewMode') || 'table');
  const [searchParams, setSearchParams] = useSearchParams();
  const isBlocked = searchParams.get('blocked') === 'true';
  const categoryFilter = searchParams.get('category');

  const dismissAlert = () => {
    searchParams.delete('blocked');
    setSearchParams(searchParams);
  };

  const handleCategoryClick = (category) => {
    setSearchParams({ category });
  };

  const clearCategoryFilter = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'table' ? 'card' : 'table';
    setViewMode(newMode);
    localStorage.setItem('homeViewMode', newMode); 
  };

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        setLoading(true);
        const endpoint = categoryFilter 
          ? `/inventories?category=${encodeURIComponent(categoryFilter)}` 
          : '/inventories';

        const response = await api.get(endpoint);
        const data = response.data.data || [];
        setInventories(data);

        const sortedByPopularity = [...data].sort((a, b) => (b._count?.items || 0) - (a._count?.items || 0));
        const top5 = sortedByPopularity.slice(0, 5);
        setTopInventories(top5);

        const tagCounts = {};
        data.forEach(inv => {
          inv.tags?.forEach(tag => {
            tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          });
        });

        const formattedTags = Object.keys(tagCounts)
          .map(key => ({
            value: key,
            count: tagCounts[key]
          }))
          .sort((a, b) => a.value.localeCompare(b.value));
        
        setTagData(formattedTags);
      } catch (error) {
        console.error("Failed to fetch inventories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [searchParams, categoryFilter]);

  const handleTagClick = (tagValue) => {
    navigate(`/search?tag=${encodeURIComponent(tagValue)}`);
  };

  if (loading && inventories.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const linkColor = isDark ? 'text-info' : 'text-primary'; 
  const cardBgColor = isDark ? 'dark' : 'white';
  const renderInventoryList = (invList, isTopPopular = false) => {
    if (invList.length === 0) {
      return (
        <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className="shadow-sm border-0 text-center py-5">
          <Card.Body className={mutedColor}>
            {isTopPopular ? t('home.no_items_yet', 'No items have been added to any inventories yet.') : t('home.no_inventories', 'No inventories found.')}
          </Card.Body>
        </Card>
      );
    }

    if (viewMode === 'table') {
      return (
        <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover variant={isDark ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}></th> 
                  <th>{t('home.title', 'Title')}</th>
                  <th>{t('home.category', 'Category')}</th>
                  {isTopPopular ? (
                    <th>{t('home.items_count', 'Items Count')}</th>
                  ) : (
                    <>
                      <th>{t('home.author', 'Author')}</th>
                      <th>{t('home.tags', 'Tags')}</th>
                    </>
                  )}
                  <th>{t('home.date', 'Date')}</th>
                </tr>
              </thead>
              <tbody>
                {invList.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      {inv.imageUrl ? (
                        <img 
                          src={inv.imageUrl} 
                          alt="Cover" 
                          className="rounded border"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className={`rounded border d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary text-dark' : 'bg-light text-muted'}`}
                          style={{ width: '45px', height: '45px' }}
                        >
                          <FaImage />
                        </div>
                      )}
                    </td>
                    <td>
                      <Link to={`/inventory/${inv.id}`} className={`text-decoration-none fw-bold ${linkColor}`}>
                        {inv.title}
                      </Link>
                    </td>
                    <td>
                      <Badge bg="secondary" style={{ cursor: 'pointer' }} onClick={() => handleCategoryClick(inv.category)}>
                        {inv.category}
                      </Badge>
                    </td>
                    
                    {isTopPopular ? (
                      <td><Badge bg="success" className="p-2 fs-6">{inv._count?.items || 0} {t('home.items', 'items')}</Badge></td>
                    ) : (
                      <>
                        <td className={textColor}>{inv.author?.name}</td>
                        <td>
                          {inv.tags?.slice(0, 3).map(tag => (
                            <Badge bg="info" text="dark" className="me-1" key={tag.id} style={{ cursor: 'pointer' }} onClick={() => handleTagClick(tag.name)}>
                              {tag.name}
                            </Badge>
                          ))}
                          {(inv.tags?.length || 0) > 3 && <span className={`${mutedColor} text-sm`}>+{inv.tags.length - 3}</span>}
                        </td>
                      </>
                    )}
                    
                    <td className={textColor}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      );
    }
    return (
      <Row className="g-4">
        {invList.map((inv) => (
          <Col md={6} xl={4} key={inv.id}>
            <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className={`shadow-sm h-100 hover-lift ${isDark ? 'border-secondary' : 'border-0'} overflow-hidden`}>
              {inv.imageUrl ? (
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <img src={inv.imageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div 
                  className={`d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary text-dark' : 'bg-light text-muted'}`}
                  style={{ height: '140px' }}
                >
                  <FaImage size={40} className="opacity-50" />
                </div>
              )}

              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Link to={`/inventory/${inv.id}`} className={`text-decoration-none fw-bold fs-5 text-truncate ${linkColor} me-2`} title={inv.title}>
                    {inv.title}
                  </Link>
                  <Badge bg="secondary" style={{ cursor: 'pointer' }} onClick={() => handleCategoryClick(inv.category)}>
                    {inv.category}
                  </Badge>
                </div>
                
                {isTopPopular ? (
                  <div className="mb-3">
                    <Badge bg="success" className="p-2 fs-6">{inv._count?.items || 0} {t('home.items', 'items')}</Badge>
                  </div>
                ) : (
                  <>
                    <div className={`${mutedColor} small mb-3`}>
                      <span className={`fw-semibold ${textColor}`}>By:</span> {inv.author?.name}
                    </div>

                    <div className="mt-auto">
                      {inv.tags?.slice(0, 4).map(tag => (
                        <Badge bg="info" text="dark" className="me-1 mb-1" key={tag.id} style={{ cursor: 'pointer' }} onClick={() => handleTagClick(tag.name)}>
                          {tag.name}
                        </Badge>
                      ))}
                      {(inv.tags?.length || 0) > 4 && <Badge bg="light" text="dark" className="border mb-1">+{inv.tags.length - 4}</Badge>}
                    </div>
                  </>
                )}
              </Card.Body>
              <Card.Footer className={`bg-transparent ${mutedColor} text-end small py-2 ${isDark ? 'border-secondary' : 'border-top-0'}`}>
                📅 {new Date(inv.createdAt).toLocaleDateString()}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="mt-4">
      {isBlocked && (
        <Alert variant="danger" onClose={dismissAlert} dismissible className="shadow-sm rounded-3 mb-4">
          <Alert.Heading className="fw-bold">🚫 {t('home.account_suspended', 'Account Suspended')}</Alert.Heading>
          <p className="mb-0">{t('home.account_suspended_message', 'Your session was terminated because your account has been blocked.')}</p>
        </Alert>
      )}

      <Row>
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h2 className={`mb-0 text-uppercase ${textColor}`}>{t('home.latest_inventories', 'Latest Inventories')}</h2>
              {categoryFilter && (
                <Button variant="outline-danger" size="sm" onClick={clearCategoryFilter}>
                  ✖ {t('home.clear_filter', 'Clear Filter')} ({categoryFilter})
                </Button>
              )}
            </div>
            <Button 
              variant={isDark ? 'outline-light' : 'outline-primary'} 
              size="sm" 
              onClick={toggleViewMode}
              title={viewMode === 'table' ? "Switch to Card View" : "Switch to Table View"}
              className="d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              {viewMode === 'table' ? <FaThLarge size={18} /> : <FaList size={18} />}
            </Button>
          </div>

          {renderInventoryList(inventories.slice(0, 10))}

          <h2 className={`mb-4 mt-5 text-uppercase ${textColor}`}> {t('home.top_popular', 'Top 5 Popular Inventories')}</h2>
          {renderInventoryList(topInventories, true)}

        </Col>

        <Col lg={3} className="mt-4 mt-lg-0">
          <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className={`shadow-sm sticky-top ${isDark ? 'border-secondary' : 'border-0'}`} style={{ top: '20px', zIndex: 10 }}>
            <Card.Header className="bg-primary text-white fw-bold py-3 text-center border-bottom-0">
              🏷️ {t('home.popular_tags', 'Popular Tags')}
            </Card.Header>
            <Card.Body className="p-4">
              {tagData.length > 0 ? (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {tagData.map((tag) => (
                    <Button
                      key={tag.value}
                      variant={isDark ? 'outline-info' : 'outline-primary'}
                      size="sm"
                      className="rounded-pill fw-bold shadow-sm d-flex align-items-center"
                      onClick={() => handleTagClick(tag.value)}
                    >
                      {tag.value}
                      <Badge bg={isDark ? 'info' : 'primary'} text={isDark ? 'dark' : 'white'} className="ms-2 rounded-pill">
                        {tag.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className={`text-center mb-0 ${mutedColor}`}>{t('home.no_tags', 'No tags yet.')}</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;