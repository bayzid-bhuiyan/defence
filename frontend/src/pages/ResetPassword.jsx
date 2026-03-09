import React, { useState, useContext } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaLock, FaArrowLeft, FaKey } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';

const ResetPassword = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Check your code and try again.');
    } finally {
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
              <h2 className="fw-bold mb-2">Reset Password</h2>
              <p className={`${isDark ? 'text-light opacity-75' : 'text-muted'}`}>
               
              </p>
            </div>

            {error && <Alert variant="danger" className="p-2">{error}</Alert>}
            {message && <Alert variant="success" className="p-2">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
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
                <Form.Label className="small fw-bold">6-Digit Recovery Code</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter the code" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength="6"
                  className={isDark ? 'bg-black text-white border-secondary' : 'bg-light border-light'}
                  style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem', padding: '0.75rem' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">New Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  className={isDark ? 'bg-black text-white border-secondary' : 'bg-light border-light'}
                  style={{ padding: '0.75rem' }}
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 fw-bold d-flex align-items-center justify-content-center mb-4"
                disabled={isLoading || !email || !code || !newPassword}
                style={{ padding: '0.75rem' }}
              >
                {isLoading ? <Spinner size="sm" className="me-2" /> : <FaLock className="me-2" />}
                Update Password
              </Button>
            </Form>

            <div>
              <Link 
                to="/login" 
                className={`text-decoration-none d-flex align-items-center ${isDark ? 'text-info' : 'text-primary'}`}
                style={{ fontWeight: '500' }}
              >
                <FaArrowLeft className="me-2" /> Back to Login
              </Link>
            </div>
          </Col>
          <Col md={6} className={`p-5 d-flex flex-column justify-content-center align-items-center text-center ${isDark ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
            <FaKey size={60} className={`mb-4 ${isDark ? 'text-light opacity-50' : 'text-primary opacity-75'}`} />
            
            <h4 className="fw-bold mb-3">Password Security</h4>
            <p className={`mb-4 ${isDark ? 'text-light opacity-75' : 'text-muted'}`} style={{ maxWidth: '80%' }}>
             We highly recommend using a combination of uppercase letters, lowercase letters, and numbers for maximum security.
            </p>
            
            <span className={`small ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
            
            </span>
          </Col>

        </Row>
      </Card>
    </Container>
  );
};

export default ResetPassword;