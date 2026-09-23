import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!avatar) {
      toast.error('Avatar is required');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      fd.append('email', formData.email);
      fd.append('username', formData.username);
      fd.append('password', formData.password);
      fd.append('avatar', avatar);
      if (coverImage) {
        fd.append('coverImage', coverImage);
      }

      await register(fd);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const message = getErrorMessage(err, 'Registration failed');
      toast.error(message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-container auth-container-wide glass animate-scale-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">VideoTube</span>
          </Link>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join VideoTube and start sharing</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="register-fullname">Full Name</label>
              <input
                type="text"
                id="register-fullname"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-username">Username</label>
              <input
                type="text"
                id="register-username"
                name="username"
                className="form-input"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              name="email"
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              name="password"
              className="form-input"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="register-avatar">
                Avatar <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar preview" className="file-preview-avatar" />
                )}
                <input
                  type="file"
                  id="register-avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="form-input-file"
                />
                <label htmlFor="register-avatar" className="file-input-label">
                  {avatar ? avatar.name : 'Choose avatar image'}
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-cover">Cover Image</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="register-cover"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="form-input-file"
                />
                <label htmlFor="register-cover" className="file-input-label">
                  {coverImage ? coverImage.name : 'Choose cover image (optional)'}
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="register-submit">
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
