import React, { useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { FaBan } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <-- ADDED
import { ThemeContext } from '../context/ThemeContext'; // <-- ADDED

const BlockedPage = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5" style={{ minHeight: '60vh' }}>
      <Card 
        bg={isDark ? 'dark' : 'white'} 
        text={isDark ? 'white' : 'dark'} 
        className={`text-center shadow-lg p-5 rounded-4 ${isDark ? 'border-secondary' : 'border-0'}`} 
        style={{ maxWidth: '500px' }}
      >
        <FaBan className="text-danger mx-auto mb-4" size={80} />
        <h2 className="mb-3 text-danger fw-bold">{t('blockedPage.title', 'Access Denied')}</h2>
        <p className={`${isDark ? 'text-light opacity-75' : 'text-muted'} mb-4 fs-5`}>
          {t('blockedPage.message', 'Your account has been blocked by an administrator. You no longer have permission to log in or interact with this platform.')}
        </p>
        <Button as={Link} to="/" variant={isDark ? "outline-light" : "outline-secondary"}>
          {t('blockedPage.returnHome', 'Return to Home (Read-Only)')}
        </Button>
      </Card>
    </Container>
  );
};

export default BlockedPage;