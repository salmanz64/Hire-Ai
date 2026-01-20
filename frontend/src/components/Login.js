import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (isSubmitting || loading) {
        return false;
      }
      
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return false;
      }

      setIsSubmitting(true);
      setLoading(true);
      setError('');

      try {
        await login(formData.email, formData.password);
        setError('');
        navigate('/app/dashboard');
      } catch (err) {
        const errorMessage = err.message || 'Login failed. Please try again.';
        console.error('Login error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
      return false;
    } catch (error) {
      console.error('handleSubmit error:', error);
      return false;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">HR</div>
            <div className="logo-text">HireAI</div>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          {error && (
            <div className="alert alert-error" key={error} style={{ animation: 'none', opacity: '1', transition: 'none' }}>
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-message">{error}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <button 
                type="button" 
                className="button-link" 
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="button-primary button-lg" 
            style={{ width: '100%' }}
            disabled={loading || isSubmitting}
            onClick={(e) => {
              if (loading || isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {loading || isSubmitting ? (
              <>
                <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="button-link" 
              onClick={() => navigate('/signup')}
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
