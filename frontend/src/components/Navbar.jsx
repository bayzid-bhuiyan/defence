import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app-language', lng); 
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); 
    }
  };

  const isDark = theme === 'dark';

  return (
    <Navbar 
      bg={isDark ? 'dark' : 'primary'} 
      variant="dark" 
      expand="lg" 
      className={`mb-4 shadow-sm ${isDark ? 'border-bottom border-secondary' : ''}`}
      style={{ zIndex: 1030 }}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          {t('navbar.brand')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="text-white">{t('navbar.home')}</Nav.Link>
            
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/personal" className="text-white">{t('navbar.personal')}</Nav.Link>
                {user?.isAdmin && (
                  <Nav.Link as={Link} to="/admin" className="text-white">{t('navbar.admin')}</Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Form className="d-flex mx-lg-3 my-2 my-lg-0" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder={t('navbar.search')}
              className={`me-2 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light text-dark'}`}
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form>

          <Nav className="align-items-center">
            <Dropdown className="me-3">
              <Dropdown.Toggle variant={isDark ? 'outline-light' : 'light'} size="sm">
                {i18n.language.toUpperCase()}
              </Dropdown.Toggle>
              <Dropdown.Menu variant={isDark ? 'dark' : 'light'} align="end">
                <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('bn')}>বাংলা</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button 
              variant={isDark ? 'outline-light' : 'light'} 
              size="sm" 
              onClick={toggleTheme} 
              className="me-3 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </Button>

            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="text-white me-3 fw-bold">{user?.name}</span>
                <Button variant="danger" size="sm" onClick={logout}>{t('navbar.logout')}</Button>
              </div>
            ) : (
              <Button as={Link} to="/login" variant="success" size="sm" className="fw-bold">
                {t('navbar.login')}
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;