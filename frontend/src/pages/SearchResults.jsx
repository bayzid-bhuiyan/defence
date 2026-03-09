import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Spinner, Alert, Card } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { FaSearch, FaTags } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../context/ThemeContext'; 
import api from '../services/api';

const SearchResults = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const query = searchParams.get('q');
  const tag = searchParams.get('tag');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query) {
          const response = await api.get(`/inventories?search=${query}`);
          setResults(response.data.data || []);
        } else if (tag) {
          const response = await api.get('/inventories');
          const allInventories = response.data.data || [];
          const filtered = allInventories.filter(inv => 
            inv.tags?.some(t => t.name.toLowerCase() === tag.toLowerCase())
          );
          setResults(filtered);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query, tag]);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant={isDark ? "light" : "primary"} /></Container>;

  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const linkColor = isDark ? 'text-info' : 'text-primary';
  const cardBgColor = isDark ? 'dark' : 'white';

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center mb-4">
        {query ? (
          <h3 className={`mb-0 ${textColor}`}><FaSearch className={`me-2 ${linkColor}`} /> {t('searchResults.search_for', 'Search Results for:')} <strong>"{query}"</strong></h3>
        ) : tag ? (
          <h3 className={`mb-0 ${textColor}`}><FaTags className="me-2 text-info" /> {t('searchResults.tagged', 'Inventories tagged:')} <strong>{tag}</strong></h3>
        ) : (
          <h3 className={`mb-0 ${textColor}`}>{t('searchResults.no_params', 'No Search Parameters Provided')}</h3>
        )}
      </div>

      {results.length === 0 ? (
        <Alert variant={isDark ? "dark" : "warning"} className={`shadow-sm ${isDark ? 'border-secondary text-white' : ''}`}>
          {t('searchResults.no_results', 'No inventories found matching your criteria.')}
        </Alert>
      ) : (
        <Card bg={cardBgColor} text={isDark ? 'white' : 'dark'} className={`shadow-sm ${isDark ? 'border-secondary' : 'border-0'}`}>
          <Card.Body className="p-0">
            <Table responsive hover variant={isDark ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead className={isDark ? "table-dark" : "table-light"}>
                <tr>
                  <th>{t('searchResults.table.title', 'Title')}</th>
                  <th>{t('searchResults.table.category', 'Category')}</th>
                  <th>{t('searchResults.table.tags', 'Tags')}</th>
                  <th>{t('searchResults.table.author', 'Author')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/inventory/${inv.id}`} className={`fw-bold text-decoration-none ${linkColor}`}>
                        {inv.title}
                      </Link>
                      <div className={`small ${mutedColor} text-truncate mt-1`} style={{ maxWidth: '400px' }}>
                        {inv.description}
                      </div>
                    </td>
                    <td><Badge bg="secondary">{inv.category}</Badge></td>
                    <td>
                      {inv.tags?.map(t => (
                        <Badge 
                          bg={t.name.toLowerCase() === tag?.toLowerCase() ? "warning" : "info"} 
                          text={t.name.toLowerCase() === tag?.toLowerCase() ? "dark" : (isDark ? "dark" : "light")} 
                          className="me-1" 
                          key={t.id || t.name}
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </td>
                    <td className={textColor}>{inv.authorName || inv.author?.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default SearchResults;