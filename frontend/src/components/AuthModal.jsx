import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = tab === 'login' 
      ? { email, password }
      : { name, email, password, phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.access_token);
      onClose();
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@candidate.com',
          password: 'DemoPassword123!'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Demo login failed');
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.access_token);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h3 className="modal-title">
              {tab === 'login' ? 'Sign In to Your Account' : 'Create Free Account'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="auth-tab-buttons">
          <button
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            <LogIn className="w-4 h-4 mr-1.5" /> Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Register
          </button>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                required
                className="text-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              className="text-input"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="text-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="input-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="text-input"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="demo-login-divider">
          <span>Or Quick Access For Evaluation</span>
        </div>

        <button
          type="button"
          className="demo-account-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
          <span>Instant Demo Login (Evaluator Mode)</span>
        </button>
      </div>
    </div>
  );
}
