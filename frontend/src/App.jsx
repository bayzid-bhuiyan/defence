import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import { Container } from 'react-bootstrap';
import Home from './pages/Home'; 
import Personal from './pages/Personal';
import Admin from './pages/Admin';
import InventoryView from './pages/InventoryView';
import SearchResults from './pages/SearchResults';
import BlockedPage from './pages/BlockedPage';
import Login from './pages/Login'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    <ThemeProvider>
      <AuthProvider> 
        <Router>
          <div className="min-vh-100 bg-body text-body">
            <AppNavbar />
            <Container>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/personal" element={<Personal />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/inventory/:id" element={<InventoryView />} />
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/" element={<Home />} />
                <Route path="/blocked" element={<BlockedPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </Container>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;