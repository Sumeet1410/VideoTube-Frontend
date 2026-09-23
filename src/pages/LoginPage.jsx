import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import './AuthPages.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed');
      toast.error(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-container glass animate-scale-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">VideoTube</span>
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="login-submit">
            Sign in
          </Button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}
