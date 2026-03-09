import React, { useState, useContext } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaGoogle, FaFacebook, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { localLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL = 'BAckend_url';

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await localLogin(email, password);
    
    if (result.success) {
      navigate('/personal'); 
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh', padding: '2rem 1rem' }}>
      <Card 
        className={`shadow-lg border-0 overflow-hidden ${isDark ? 'bg-dark text-white' : 'bg-white text-dark'}`} 
        style={{ width: '100%', maxWidth: '900px', borderRadius: '15px' }}
      >
        <Row className="g-0">
          <Col md={6} className="p-5 d-flex flex-column justify-content-center">
            <div className="mb-4">
              <h2 className="fw-bold mb-2">{t('login.welcome', 'Welcome Back')}</h2>
              <p className={`${isDark ? 'text-light opacity-75' : 'text-muted'}`}>
                {t('login.subtitle', 'Sign in to manage your inventories and items.')}
              </p>
            </div>

            {error && <Alert variant="danger" className="p-2">{error}</Alert>}

            <Form onSubmit={handleLocalLogin}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={isDark ? 'bg-black text-white border-secondary' : 'bg-light border-light'}
                  style={{ padding: '0.75rem' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={isDark ? 'bg-black text-white border-secondary' : 'bg-light border-light'}
                  style={{ padding: '0.75rem' }}
                />
              </Form.Group>

              <div className="d-flex justify-content-end mb-4">
                <Link 
                  to="/forgot-password" 
                  className={isDark ? 'text-info' : 'text-primary'} 
                  style={{ fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}
                >
                  Forgot Password?
                </Link>
              </div>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 fw-bold d-flex align-items-center justify-content-center"
                disabled={isLoading}
                style={{ padding: '0.75rem' }}
              >
                {isLoading ? <Spinner size="sm" className="me-2" /> : <FaSignInAlt className="me-2" />}
                Sign In
              </Button>
            </Form>
          </Col>

          <Col md={6} className={`p-5 d-flex flex-column justify-content-center align-items-center ${isDark ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
            <div className="text-center mb-4">
              <h4 className="fw-bold mb-2"></h4>
              <p className={`small ${isDark ? 'text-light opacity-75' : 'text-muted'}`}>
                
              </p>
            </div>
            
            <div className="d-grid gap-3 w-100" style={{ maxWidth: '300px' }}>
              <Button 
                variant={isDark ? "outline-light" : "outline-dark"} 
                size="lg"
                className="d-flex align-items-center justify-content-center shadow-sm"
                onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
                style={{ padding: '0.75rem', borderRadius: '8px' }}
              >
                <FaGoogle className="me-3 text-danger" /> {t('login.google', 'Sign in with Google')}
              </Button>
              <Button 
                variant="primary" 
                size="lg"
                className="d-flex align-items-center justify-content-center shadow-sm text-white"
                style={{ backgroundColor: '#1877F2', borderColor: '#1877F2', padding: '0.75rem', borderRadius: '8px' }}
                onClick={() => window.location.href = `${BACKEND_URL}/api/auth/facebook`}
              >
                <FaFacebook className="me-3" /> {t('login.facebook', 'Sign in with Facebook')}
              </Button>
            </div>
            
            <div className="mt-5 text-center">
              <span className={`small ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
               
              </span>
            </div>
          </Col>

        </Row>
      </Card>
    </Container>
  );
};

export default Login;